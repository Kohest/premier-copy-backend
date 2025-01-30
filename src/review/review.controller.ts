import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { createReviewDto } from './dto/review.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('/create')
  @Auth()
  @UsePipes(new ValidationPipe())
  async createReview(
    @CurrentUser('id') userId: string,
    @Body() dto: createReviewDto,
  ) {
    return this.reviewService.createReview(userId, dto);
  }

  @Delete('/delete/:contentId')
  @Auth()
  async deleteReview(
    @CurrentUser('id') userId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.reviewService.deleteReview(userId, contentId);
  }

  @Get('/current/:contentId')
  @Auth()
  async getCurrentUserReview(
    @CurrentUser('id') userId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.reviewService.getCurrentUserReview(userId, contentId);
  }
  @Get('/average/:contentId')
  async getAverageRating(@Param('contentId') contentId: string) {
    return this.reviewService.getAverageRating(contentId);
  }
  @Get('all/:contentId')
  async getAllReviews(@Param('contentId') contentId: string) {
    return this.reviewService.getAllReviews(contentId);
  }
}
