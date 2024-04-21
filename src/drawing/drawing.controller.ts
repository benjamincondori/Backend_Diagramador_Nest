import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DrawingService } from './drawing.service';
import { CreateDrawingDto, UpdateDrawingDto } from './dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { FilterDrawing } from './filter/filter';
import { User } from '../auth/entities/user.entity';

@ApiTags('Drawing')
@Controller('drawing')
export class DrawingController {
  constructor(private readonly drawingService: DrawingService) {}

  @Get('open-drawing')
  @Auth()
  openDiagram(
    @Query('token') token: string,
    @GetUser('id') authUserId: string,
  ) {
    const payload = this.drawingService.verifyPayload(token);
    return this.drawingService.addCollaborator(payload.drawingId, authUserId);
  }

  @Get('collaborations')
  @Auth()
  diagramCollaborations(@GetUser('id') authUserId: string) {
    return this.drawingService.drawingCollaborations(authUserId);
  }

  @Post('create')
  @Auth()
  create(
    @Body() createDrawingDto: CreateDrawingDto,
    @GetUser('id') userAuthId: string,
  ) {
    return this.drawingService.create(createDrawingDto, userAuthId);
  }

  @Get(':id')
  @Auth()
  show(@Param('id', ParseUUIDPipe) id: string) {
    return this.drawingService.show(id);
  }

  @Get()
  @Auth()
  findAuthUserDrawings(
    @Query() paginationDto: PaginationDto,
    @Body() dataBody: FilterDrawing,
    @GetUser() authUser: User,
  ) {
    return this.drawingService.findAuthUserDrawings(
      paginationDto,
      dataBody,
      authUser,
    );
  }

  @Patch('update/:id')
  @Auth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDrawingDto: UpdateDrawingDto,
  ) {
    return this.drawingService.update(id, updateDrawingDto);
  }

  @Delete('delete/:id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.drawingService.remove(id);
  }

  @Get('share-token/:drawingId')
  @Auth()
  shareToken(
    @Param('drawingId', ParseUUIDPipe) drawingId: string,
    @Req() req: any,
  ) {
    const token = this.drawingService.generateTokenShareDiagram(drawingId);
    const shareUrl = `${token}`;
    return { shareUrl };
  }

  @Get('validateToken/:token')
  @Auth()
  validateToken(
    @Param('token') token: string,
    @GetUser('id') authUserId: string,
  ) {
    return this.drawingService.verifyToken(token, authUserId);
  }
}
