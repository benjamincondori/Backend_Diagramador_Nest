import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CoWorkerService } from './co-worker.service';
import { UpdateCoWorkerDto } from './dto/update-co-worker.dto';

@Controller('co-worker')
export class CoWorkerController {
  constructor(private readonly coWorkerService: CoWorkerService) {}

  @Get()
  findAll() {
    return this.coWorkerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coWorkerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCoWorkerDto: UpdateCoWorkerDto,
  ) {
    return this.coWorkerService.update(+id, updateCoWorkerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coWorkerService.remove(+id);
  }
}
