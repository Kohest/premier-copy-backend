import { Module } from '@nestjs/common';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';
import { ContentModule } from 'src/content/content.module';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma.service';
import { ReviewService } from 'src/review/review.service';

@Module({
  imports: [ContentModule, UserModule],
  controllers: [FavoriteController],
  providers: [FavoriteService, PrismaService, ReviewService],
  exports: [FavoriteService],
})
export class FavoriteModule {}
