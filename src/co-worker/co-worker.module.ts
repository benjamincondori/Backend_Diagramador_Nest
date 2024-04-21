import { Module } from '@nestjs/common';
import { CoWorkerService } from './co-worker.service';
import { CoWorkerController } from './co-worker.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoWorker } from './entities/co-worker.entity';

@Module({
  controllers: [CoWorkerController],
  providers: [CoWorkerService],
  imports: [TypeOrmModule.forFeature([CoWorker])],
  exports: [TypeOrmModule],
})
export class CoWorkerModule {}
