import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface UserData {
  id: string;
  fullname: string;
  photo: string;
}

interface RoomClients {
  [socketId: string]: {
    socket: Socket,
    user: UserData,
  };
}

interface RoomMap {
  [roomId: string]: RoomClients;
}

@Injectable()
export class WebSocketsService {
  private roomConnectedClients: RoomMap = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Conecta al cliente
  async onClientConnected(client: Socket, userId: string, nameRoom: string) {
    const user = await this.userRepository.findOne({
      relations: { profile: true },
      where: { id: userId },
    });

    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User is not active');

    this.checkUserConnection(user);

    const userData = {
      id: user.id,
      fullname: `${user.name} ${user.lastName}`,
      photo: user.profile.photo,
    };

    this.addUserToRoom(nameRoom, client, userData);
  }

  // Desconecta al cliente
  async onClientDisconnect(clientId: string, roomName: string) {
    await this.removeUserFromRoom(clientId, roomName);
  }

  // Obtiene los clientes conectados en la sala
  getConnectedClients(roomName: string) {
    console.log(this.roomConnectedClients)
    return this.getUsersInRoom(roomName);
  }
  
  // Remueve al usuario de todas las salas
  async removeUserFromAllRoomsById(userId: string, roomName: string) {
    if (this.roomConnectedClients[roomName]) {
      for (const clientId of Object.keys(this.roomConnectedClients[roomName])) {
        if (this.roomConnectedClients[roomName][clientId].user.id === userId) {
          delete this.roomConnectedClients[roomName][clientId];
        }
      }
      if (Object.keys(this.roomConnectedClients[roomName]).length === 0) {
        await delete this.roomConnectedClients[roomName];
      }
    }
  }
  
  
  // Agrega al usuario a la sala
  private addUserToRoom(roomName: string, socket: Socket, user: UserData) {
    if (!this.roomConnectedClients[roomName]) {
      this.roomConnectedClients[roomName] = {};
    }
    this.roomConnectedClients[roomName][socket.id] = { socket, user };
  }

  // Remueve al usuario de la sala
  private async removeUserFromRoom(clientId: string, roomName: string) {
    if (this.roomConnectedClients[roomName] && this.roomConnectedClients[roomName][clientId]) {
      delete this.roomConnectedClients[roomName][clientId];
      if (Object.keys(this.roomConnectedClients[roomName]).length === 0) {
        await delete this.roomConnectedClients[roomName];
      }
    }
  }

  
  getAllRoomIds(): string[] {
    return Object.keys(this.roomConnectedClients);
  }

  // Obtiene los usuarios en la sala
  private getUsersInRoom(roomName: string): UserData[] {
    const clientsInRoom = this.roomConnectedClients[roomName];
    if (!clientsInRoom) {
      return [];
    }
    return Object.values(clientsInRoom).map((client) => client.user);
  }

  // Verifica si el usuario ya tiene una conexión activa
  private checkUserConnection(user: User) {
    for (const roomName of Object.keys(this.roomConnectedClients)) {
      const roomClients = this.roomConnectedClients[roomName];
      const isUserConnected = Object.values(roomClients).some(
        (client) => client.user.id === user.id,
      );
      if (isUserConnected) {
        const clientId = Object.keys(roomClients).find((clientId) => roomClients[clientId].user.id === user.id);
        if (clientId) {
          roomClients[clientId].socket.disconnect();
          break;
        }
      }
    }
  }
}
