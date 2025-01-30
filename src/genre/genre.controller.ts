import { CreateGenreDto, UpdateGenreDto } from './dto/genre.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  SetMetadata,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}
  @Get('all')
  async getAll() {
    return this.genreService.getAll();
  }

  @Post('create')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  async createGenre(@Body() body: CreateGenreDto) {
    return this.genreService.createGenre(body);
  }

  @Delete('delete/:id')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteGenre(@Param('id') id: string) {
    return this.genreService.deleteGenre(id);
  }

  @Patch('update/:id')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  async updateGenre(@Param('id') id: string, @Body() body: UpdateGenreDto) {
    return this.genreService.updateGenre(id, body);
  }
  @Patch(':contentId/add-genre/:genreId')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async addGenreToCollection(
    @Param('contentId') contentId: string,
    @Param('genreId') genreId: string,
  ) {
    return this.genreService.addGenreToContent(contentId, genreId);
  }
  @Patch(':contentId/remove-genre/:genreId')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async removeGenreFromCollection(
    @Param('contentId') contentId: string,
    @Param('genreId') genreId: string,
  ) {
    return this.genreService.removeGenreFromContent(contentId, genreId);
  }
}
