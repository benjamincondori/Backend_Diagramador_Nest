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
    const token = client.handshake.headers.authentication as string;
    const { nameRoom } = client.handshake.query;
    let payload: JwtPayload;
    
    try {
      payload = this.jwtService.verify(token);
      await this.webSocketsService.onClientConnected(client, payload.id);
      client.join(nameRoom);
      console.log(`El cliente: ${client.id} se unió a la sala: ${nameRoom}`)
    } catch (error) {
      client.disconnect();
      return;
    }
    
    this.server.to(nameRoom).emit('clients-updated', this.webSocketsService.getConnectedClients());
  }
  
  async handleDisconnect(client: Socket) {
    const { nameRoom } = client.handshake.query;
    await this.webSocketsService.onClientDisconnect(client.id);
    this.server.to(nameRoom).emit('clients-updated', this.webSocketsService.getConnectedClients());
    
    console.log(`El cliente: ${client.id} se desconectó de la sala: ${nameRoom}`)
  }
  
  @SubscribeMessage('update-diagram-client')
  async updateDiagramFromServer(
    @MessageBody() payload: NewPayloadDto, 
    @ConnectedSocket() client: Socket
  ) {
    const { id, data } = payload;
    const { nameRoom } = client.handshake.query;
    
    await this.drawingService.update(id, { data });
    
    client.to(nameRoom).emit('update-diagram-server', payload.data);
  }
  
}
