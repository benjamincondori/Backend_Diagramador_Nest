import { Module } from '@nestjs/common';
import { DrawingService } from './drawing.service';
import { DrawingController } from './drawing.controller';
import { Drawing } from './entities/drawing.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [DrawingController],
  providers: [DrawingService],
  imports: [TypeOrmModule.forFeature([Drawing]), AuthModule],
  exports: [TypeOrmModule],
})
export class DrawingModule {}
