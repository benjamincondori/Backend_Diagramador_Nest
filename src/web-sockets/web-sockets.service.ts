import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
  [id: string]: {
    socket: Socket,
    user: UserData,
  }
}

interface UserData {
  id: string,
  fullname: string,
  photo: string,
}

@Injectable()
export class WebSocketsService {
  
  private connectedClients: ConnectedClients = {}
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  
  // Conecta al cliente
  async onClientConnected(client: Socket, userId: string) {
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
    }
    
    this.connectedClients[client.id] = {
      socket: client,
      user: userData,
    };
  }
  
  // Desconecta al cliente
  async onClientDisconnect(clientId: string) {
    await delete this.connectedClients[clientId];
  }
  
  getConnectedClients() {
    return Object.values(this.connectedClients).map((client) => client.user);
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
