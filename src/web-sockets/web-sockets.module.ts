import { Module } from '@nestjs/common';
import { WebSocketsService } from './web-sockets.service';
import { WebSocketsGateway } from './web-sockets.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { DrawingModule } from 'src/drawing/drawing.module';
import { DrawingService } from 'src/drawing/drawing.service';

@Module({
  providers: [WebSocketsGateway, WebSocketsService, DrawingService],
  imports: [AuthModule, DrawingModule],
})
export class WebSocketsModule {}
