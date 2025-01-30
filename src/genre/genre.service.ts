import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateGenreDto, UpdateGenreDto } from './dto/genre.dto';

@Injectable()
export class GenreService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.genre.findMany();
  }
  async createGenre(body: CreateGenreDto) {
    return this.prisma.genre.create({ data: body });
  }
  async deleteGenre(id: string) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) throw new Error('Genre not found');
    return this.prisma.genre.delete({ where: { id } });
  }
  async updateGenre(id: string, body: UpdateGenreDto) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) throw new Error('Genre not found');
    return this.prisma.genre.update({ where: { id }, data: body });
  }
  async addGenreToContent(contentId: string, genreId: string) {
    if (!contentId) throw new Error('Content id is required');
    if (!genreId) throw new Error('Genre id is required');
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!content) {
      throw new Error(`Content with id ${contentId} not found`);
    }
    const genre = await this.prisma.genre.findUnique({
      where: { id: genreId },
    });
    if (!genre) {
      throw new Error(`Genre with id ${genreId} not found`);
    }
    return this.prisma.content.update({
      where: { id: contentId },
      data: {
        genres: {
          connect: { id: genreId },
        },
      },
    });
  }

  async removeGenreFromContent(contentId: string, genreId: string) {
    if (!contentId) throw new Error('content id is required');
    if (!genreId) throw new Error('Genre id is required');
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!content) {
      throw new Error(`Content with id ${contentId} not found`);
    }
    const genre = await this.prisma.genre.findUnique({
      where: { id: genreId },
    });
    if (!genre) {
      throw new Error(`Genre with id ${genreId} not found`);
    }
    return this.prisma.content.update({
      where: { id: contentId },
      data: {
        genres: {
          disconnect: { id: genreId },
        },
      },
    });
  }
}
