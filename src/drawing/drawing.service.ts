import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateDrawingDto, UpdateDrawingDto } from './dto';
import { Drawing } from './entities/drawing.entity';
import { Between, DataSource, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { FilterDrawing } from './filter/filter';
import { JwtService } from '@nestjs/jwt';
import { CoWorker } from '../co-worker/entities/co-worker.entity';

@Injectable()
export class DrawingService {
  private readonly logger = new Logger('DrawingService');
  constructor(
    @InjectRepository(Drawing)
    private readonly drawingRepository: Repository<Drawing>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDrawingDto: CreateDrawingDto, userAuthId: string) {
    const userAuth = await this.dataSource.getRepository(User).findOneOrFail({
      where: { id: userAuthId },
    });
    const newDrawing = this.drawingRepository.create({
      ...createDrawingDto,
      user: userAuth,
    });
    return await this.drawingRepository.save(newDrawing);
  }

  async show(term: string) {
    const drawing = await this.drawingRepository
      .createQueryBuilder('drawing')
      .leftJoinAndSelect('drawing.user', 'user')
      .leftJoinAndSelect('drawing.coWorkers', 'coworker')
      .leftJoinAndSelect('coworker.user', 'friend')
      .leftJoinAndSelect('friend.profile', 'profile')
      .where('drawing.id = :id', { id: term })
      .getOneOrFail();
    return drawing;
  }

  async findAuthUserDrawings(
    paginationDto: PaginationDto,
    dataBody: FilterDrawing,
    authUser: User,
  ) {
    // const { limit = 10, offset = 0 } = paginationDto;
    const { date, search } = dataBody;

    const whereCondition: any = {
      user: authUser,
    };

    if (date) {
      const dateIsoString = new Date(date).toISOString().split('T')[0];
      whereCondition.createdAt = Between(
        `${dateIsoString} 00:00:00`,
        `${dateIsoString} 23:59:59`,
      );
    }

    if (search) {
      whereCondition.name = Like(`%${search}%`);
    }

    const drawings = await this.drawingRepository.find({
      // take: limit,
      // skip: offset,
      order: {
        createdAt: 'DESC',
      },
      relations: {
        user: true,
        coWorkers: {
          user: true,
        },
      },
      where: whereCondition,
    });

    return drawings;
  }

  async update(drawingId: string, updateDrawingDto: UpdateDrawingDto) {
    if (Object.entries(updateDrawingDto).length === 0)
      return 'Nothing to update';

    await this.drawingRepository.update(
      { id: drawingId },
      { ...updateDrawingDto },
    );
    return {
      message: 'Successful Upgrade!'
    };
  }

  async findOne(term: string) {
    const diagram = await this.drawingRepository
      .createQueryBuilder('drawing')
      .where('drawing.id = :id', { id: term })
      .getOneOrFail();
    return diagram;
  }

  async remove(id: string) {
    const drawing = await this.findOne(id);
    await this.drawingRepository.remove(drawing);
    return { message: `Drawing with ${id} deleted successfully` };
  }

  generateTokenShareDiagram(drawingId: string) {
    const secretKey = process.env.JWT_SECRET;
    const payload = { drawingId };
    const token = this.jwtService.sign(payload, {
      secret: secretKey,
      expiresIn: '1h',
    });
    return token;
  }

  verifyPayload(token: string) {
    try {
      const payload = this.jwtService.verify(token); // Verificar y decodificar el token
      return payload;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async verifyToken(token: string, userAuthId: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verify(token);
      const drawingId = decoded.drawingId;
      const newCollaborator = await this.addCollaborator(drawingId, userAuthId);
      return {
        newCollaborator,
        drawing: await this.show(drawingId),
      };
    } catch (e) {
      this.handleDBErrors(e);
    }
  }

  async addCollaborator(drawingId: string, coWorkerUserId: string) {
    try {
      const drawing = await this.drawingRepository.findOneOrFail({
        relations: {
          user: true,
        },
        where: {
          id: drawingId,
        },
      });

      const coWorkerUser = await this.dataSource
        .getRepository(User)
        .findOneOrFail({
          relations: {
            profile: true,
          },
          where: {
            id: coWorkerUserId,
          },
        });

      // Verifica si el usuario ya es colaborador en el diagrama
      const existingCollaborator = await this.dataSource
        .getRepository(CoWorker)
        .findOne({
          where: {
            user: { id: coWorkerUserId },
            drawing: { id: drawingId },
          },
        });

      if (existingCollaborator) {
        throw new BadRequestException(
          'User is already a collaborator on this diagram',
        );
      }
      const newCoWorker = new CoWorker();
      newCoWorker.user = coWorkerUser;
      newCoWorker.drawing = drawing;
      await this.dataSource.manager.save(newCoWorker);
      //console.log(newCoWorker);

      return newCoWorker.user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async drawingCollaborations(userId: string) {
    const drawings = await this.drawingRepository
      .createQueryBuilder('drawing')
      .leftJoinAndSelect('drawing.coWorkers', 'coworker')
      .leftJoinAndSelect('coworker.user', 'user')
      .leftJoinAndSelect('drawing.user', 'userDrawing')
      .where('user.id = :id', { id: userId })
      .getMany();

    return drawings;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    // console.log(error);
    throw new InternalServerErrorException(
      `Please check server logs, ${error.message}`,
    );
  }
}
