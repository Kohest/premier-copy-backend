import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { PrismaService } from 'src/prisma.service';
import { FileService } from 'src/file/file.service';
import { ReviewService } from 'src/review/review.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [ContentController],
  providers: [
    ContentService,
    PrismaService,
    FileService,
    ReviewService,
    UserService,
  ],
})
export class ContentModule {}
