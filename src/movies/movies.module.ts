import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { PrismaService } from 'src/prisma.service';
import { FileService } from 'src/file/file.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService, PrismaService, FileService, UserService],
})
export class MoviesModule {}
