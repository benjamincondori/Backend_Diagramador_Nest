import { PartialType } from '@nestjs/swagger';
import { CreateCoWorkerDto } from './create-co-worker.dto';

export class UpdateCoWorkerDto extends PartialType(CreateCoWorkerDto) {}
