import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}
  @Auth()
  @Get()
  async getFavoriteContent(@CurrentUser('id') id: string) {
    return this.favoriteService.getFavoriteContent(id);
  }
  @Auth()
  @Post('/add/:contentId')
  async addFavoriteContent(
    @CurrentUser('id') id: string,
    @Param('contentId') contentId: string,
  ) {
    return this.favoriteService.addFavoriteContent(id, contentId);
  }
  @Auth()
  @Delete('/remove/:contentId')
  async removeFavoriteContent(
    @CurrentUser('id') id: string,
    @Param('contentId') contentId: string,
  ) {
    return this.favoriteService.removeFavoriteContent(id, contentId);
  }
}
