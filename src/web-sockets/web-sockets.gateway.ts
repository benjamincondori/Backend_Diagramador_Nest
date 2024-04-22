import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { WebSocketsService } from './web-sockets.service';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { OnModuleInit } from '@nestjs/common';
import { JwtPayload } from 'src/auth/interfaces';
import { NewPayloadDto } from './dtos/new-payload.dto';
import { DrawingService } from 'src/drawing/drawing.service';

@WebSocketGateway({ cors: true })
export class WebSocketsGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  public server: Server;
  
  constructor(
    private readonly webSocketsService: WebSocketsService,
    private readonly jwtService: JwtService,
    private readonly drawingService: DrawingService,
  ) {}
  
  onModuleInit() {
    
  }
  
  async handleConnection(client: Socket) {
    console.log('Hola alguien se conecto al socket 👌👌👌');
  }
  
  async handleDisconnect(client: Socket) {
    console.log('ALguien se fue! chao chao');
  }
  
  @SubscribeMessage('join-room')
  async joinRoom(
    @MessageBody() roomName: string, 
    @ConnectedSocket() client: Socket
  ) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    
    try {
      payload = this.jwtService.verify(token);
      await this.webSocketsService.onClientConnected(client, payload.id, roomName);
      client.join(roomName);
      console.log(`El cliente: ${client.id} se unió a la sala: ${roomName}`)
    } catch (error) {
      client.disconnect();
      return;
    }
    
    this.server.to(roomName).emit('clients-updated', this.webSocketsService.getConnectedClients(roomName));
  }
  
  @SubscribeMessage('leave-room')
  async leaveRoom(
    @MessageBody() roomName: string, 
    @ConnectedSocket() client: Socket
  ) {
    await this.webSocketsService.onClientDisconnect(client.id, roomName);
    client.leave(roomName);
    console.log(`El cliente: ${client.id} se desconectó a la sala: ${roomName}`)
    this.server.to(roomName).emit('clients-updated', this.webSocketsService.getConnectedClients(roomName));
  }
  
  @SubscribeMessage('update-diagram-client')
  async updateDiagramFromServer(
    @MessageBody() payload: NewPayloadDto, 
    @ConnectedSocket() client: Socket
  ) {
    const { id, data } = payload;
    
    await this.drawingService.update(id, { data });
    
    this.server.to(id).emit('update-diagram-server', payload.data);
  }
}
