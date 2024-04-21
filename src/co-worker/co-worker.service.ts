import { Injectable } from '@nestjs/common';
import { CreateCoWorkerDto } from './dto/create-co-worker.dto';
import { UpdateCoWorkerDto } from './dto/update-co-worker.dto';

@Injectable()
export class CoWorkerService {
  create(createCoWorkerDto: CreateCoWorkerDto) {
    return 'This action adds a new coWorker';
  }

  findAll() {
    return `This action returns all coWorker`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coWorker`;
  }

  update(id: number, updateCoWorkerDto: UpdateCoWorkerDto) {
    return `This action updates a #${id} coWorker`;
  }

  remove(id: number) {
    return `This action removes a #${id} coWorker`;
  }
}
