import { Module } from '@nestjs/common';
import { TrailerController } from './trailer.controller';
import { TrailerService } from './trailer.service';
import { FileService } from 'src/file/file.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [TrailerController],
  providers: [TrailerService, FileService, PrismaService, UserService],
})
export class TrailerModule {}
