import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ReviewService } from 'src/review/review.service';

@Injectable()
export class FavoriteService {
  constructor(
    private prisma: PrismaService,
    private reviewService: ReviewService,
  ) {}
  async addFavoriteContent(userId: string, contentId: string) {
    if (!userId || !contentId)
      throw new BadRequestException('Provide user id and content id');
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new BadRequestException('User not found');
    const content = await this.prisma.content.findUnique({
      where: {
        id: contentId,
      },
    });
    if (!content) throw new BadRequestException('Content not found');

    const existingFavorite = await this.prisma.favoriteContent.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
    });
    if (existingFavorite) {
      throw new BadRequestException('Favorite already exists');
    }
    const data = this.prisma.favoriteContent.create({
      data: {
        userId,
        contentId,
      },
      include: {
        content: true,
      },
    });
    return data;
  }
  async removeFavoriteContent(userId: string, contentId: string) {
    if (!userId || !contentId)
      throw new BadRequestException('Provide user id and content id');
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new BadRequestException('User not found');
    const content = await this.prisma.content.findUnique({
      where: {
        id: contentId,
      },
    });
    if (!content) throw new BadRequestException('Content not found');
    const existingFavorite = await this.prisma.favoriteContent.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
    });
    if (!existingFavorite) {
      throw new BadRequestException('Favorite not found');
    }
    return this.prisma.favoriteContent.delete({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
    });
  }
  async getFavoriteContent(userId: string) {
    if (!userId) {
      throw new BadRequestException('Provide user id');
    }

    const data = await this.prisma.favoriteContent.findMany({
      where: {
        userId,
      },
      select: {
        content: true,
      },
    });
    const id = data.map((item) => item.content.id);
    const result = [];
    for (let i = 0; i < id.length; i++) {
      const averageRating = await this.reviewService.getAverageRating(id[i]);
      result.push({ ...data[i].content, ...averageRating });
    }
    return result;
  }
}
