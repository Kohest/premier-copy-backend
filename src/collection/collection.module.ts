import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { PrismaService } from 'src/prisma.service';
import { ReviewService } from 'src/review/review.service';
import { UserService } from 'src/user/user.service';
import { FileService } from 'src/file/file.service';

@Module({
  controllers: [CollectionController],
  providers: [
    CollectionService,
    PrismaService,
    ReviewService,
    UserService,
    FileService,
  ],
})
export class CollectionModule {}
