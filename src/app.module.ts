import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { ProfileModule } from './profile/profile.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DrawingModule } from './drawing/drawing.module';
import { CoWorkerModule } from './co-worker/co-worker.module';
import { WebSocketsModule } from './web-sockets/web-sockets.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true, //talvez no convenga que esté en true en produccion
      //porque en produccion mas que todo modificamos con migraciones, esto 
      //podemos manejar tambien con variables de entorno
    }),
    AuthModule,
    CommonModule,
    SeedModule,
    ProfileModule,
    CloudinaryModule,
    DrawingModule,
    CoWorkerModule,
    WebSocketsModule,
  ],
})
export class AppModule {}
