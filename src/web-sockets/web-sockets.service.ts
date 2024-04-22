import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
  [id: string]: {
    socket: Socket;
    user: UserData;
  };
}

interface UserData {
  id: string;
  fullname: string;
  photo: string;
}

interface RoomClients {
  socket: Socket;
  user: UserData;
}

@Injectable()
export class WebSocketsService {
  private connectedClients: ConnectedClients = {};
  private roomConnectedClients: { [room: string]: RoomClients[] } = {};

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

    // this.connectedClients[client.id] = {
    //   socket: client,
    //   user: userData,
    // };
  }

  private addUserToRoom(roomName: string, socket: Socket, user: UserData) {
    if (!this.roomConnectedClients[roomName]) {
      this.roomConnectedClients[roomName] = [];
    }
    this.roomConnectedClients[roomName].push({ socket, user });
  }

  private removeUserFromRoom(clientId: string, roomName: string) {
    if (this.roomConnectedClients[roomName]) {
      this.roomConnectedClients[roomName] = this.roomConnectedClients[
        roomName
      ].filter((client) => client.socket.id !== clientId);
    }
  }

  private getUsersInRoom(roomName: string): UserData[] {
    const usersInRoom: UserData[] = [];
    const clientsInRoom = this.roomConnectedClients[roomName] || [];
  
    for (const client of clientsInRoom) {
      usersInRoom.push(client.user);
    }
  
    return usersInRoom;
  }
  
  // Desconecta al cliente
  async onClientDisconnect(roomName: string, clientId: string) {
    this.removeUserFromRoom(roomName, clientId);
    // await delete this.connectedClients[clientId];
  }

  getConnectedClients(roomName: string) {
    return this.getUsersInRoom(roomName);
    // return Object.values(this.connectedClients).map((client) => client.user);
  }

  // Verifica si el usuario ya tiene una conexión activa
  private checkUserConnection(user: User) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId];
      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        break;
      }
    }
  }
}
