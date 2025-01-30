import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { createReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllReviews(contentId: string) {
    return this.prisma.review.findMany({ where: { contentId } });
  }
  async createReview(userId: string, dto: createReviewDto) {
    if (!userId) throw new BadRequestException('Provide user id');
    const content = await this.prisma.content.findUnique({
      where: { id: dto.contentId },
    });

    if (!content) throw new BadRequestException('Content not found');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    const existingReview = await this.prisma.review.findFirst({
      where: { userId: userId, contentId: dto.contentId },
    });

    if (existingReview) {
      throw new BadRequestException('Review already exists');
    }
    return this.prisma.review.create({
      data: {
        comment: dto.comment,
        rating: dto.rating,
        contentId: dto.contentId,
        userId: userId,
      },
    });
  }
  async deleteReview(userId: string, contentId: string) {
    if (!userId || !contentId)
      throw new BadRequestException('Provide user id and content id');
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new BadRequestException('User not found');
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!content) throw new BadRequestException('Content not found');
    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
    });
    if (!existingReview) {
      throw new BadRequestException('Review not found');
    }
    return this.prisma.review.delete({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
    });
  }
  async getAverageRating(contentId: string) {
    if (!contentId) throw new BadRequestException('Provide content id');
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!content) throw new BadRequestException('Content not found');
    const averageRating = this.prisma.review.aggregate({
      _avg: {
        rating: true,
      },
      _count: {
        _all: true,
      },
      where: {
        contentId,
      },
    });

    return {
      averageRating: (await averageRating) || 0,
      reviewCount: (await averageRating)._count._all,
    };
  }
  async getCurrentUserReview(userId: string, contentId: string) {
    if (!contentId) throw new BadRequestException('Provide content id');
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!content) throw new BadRequestException('Content not found');

    return this.prisma.review.findFirst({
      where: {
        contentId,
        userId,
      },
    });
  }
}
