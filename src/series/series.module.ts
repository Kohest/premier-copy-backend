import { Module } from '@nestjs/common';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';
import { PrismaService } from 'src/prisma.service';
import { FileService } from 'src/file/file.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [SeriesController],
  providers: [SeriesService, PrismaService, FileService, UserService],
})
export class SeriesModule {}
