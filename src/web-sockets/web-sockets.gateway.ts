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
    let payload: JwtPayload;
    
    try {
      payload = this.jwtService.verify(token);
      await this.webSocketsService.onClientConnected(client, payload.id);
      
      console.log('conectado: ', client.id)
    } catch (error) {
      client.disconnect();
      return;
    }
    
    this.server.emit('clients-updated', this.webSocketsService.getConnectedClients());
  }
  
  async handleDisconnect(client: Socket) {
    await this.webSocketsService.onClientDisconnect(client.id);
    this.server.emit('clients-updated', this.webSocketsService.getConnectedClients());
    
    console.log('desconectado: ', client.id)
  }
  
  @SubscribeMessage('update-diagram-client')
  async updateDiagramFromServer(
    @MessageBody() payload: NewPayloadDto, 
    @ConnectedSocket() client: Socket
  ) {
    const { id, data } = payload;
    // let diagram = await this.drawingService.findOne(payload.id);
    console.log({ cliente: client.id })
    console.log({ data })
    // console.log(payload.data)
    // await this.drawingService.update(payload.id, { data: payload.data });
    
    // diagram = await this.drawingService.findOne(payload.id);
    // console.log({updated: diagram})
    client.broadcast.emit('update-diagram-server', payload.data);
  }
  
}
