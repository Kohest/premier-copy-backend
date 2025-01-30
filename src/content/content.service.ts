import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateContentDto, UpdateContentDto } from './dto/content.dto';
import { FileService, FileType } from 'src/file/file.service';
import {
  ContentType,
  Country,
  Genre,
  IContentItem,
} from './types/content.types';
import { ReviewService } from 'src/review/review.service';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
    private reviewService: ReviewService,
  ) {}
  private async createWhereClause(
    search?: string,
    genre?: Genre,
    country?: Country,
    year?: number,
    type?: ContentType,
  ): Promise<any> {
    const whereClause: any = {};

    if (search) {
      whereClause['title'] = {
        contains: search,
        mode: 'insensitive',
      };
    }
    if (genre) {
      whereClause['genres'] = {
        some: {
          name: genre,
        },
      };
    }
    if (country) {
      whereClause['country'] = {
        equals: country,
      };
    }
    if (year) {
      whereClause['releaseYear'] = {
        equals: year,
      };
    }
    if (type === 'movie') {
      whereClause['Movie'] = {
        some: {},
      };
    } else if (type === 'series') {
      whereClause['Series'] = {
        some: {},
      };
    }

    return whereClause;
  }

  private async fetchContent<T>(
    count: number,
    offset: number,
    whereClause: any,
  ): Promise<T[]> {
    const options: any = {
      take: count || 10,
      skip: offset || 0,
      where: whereClause,
      include: {
        genres: true,
        Movie: true,
        Series: true,
      },
    };

    return this.prisma.content.findMany(options) as Promise<T[]>;
  }
  async getContent(
    count = 10,
    offset = 0,
    search?: string,
    genre?: Genre,
    country?: Country,
    year?: number,
    type?: ContentType,
  ) {
    const whereClause = await this.createWhereClause(
      search,
      genre,
      country,
      year,
      type,
    );
    const contentList = await this.fetchContent<IContentItem>(
      count,
      offset,
      whereClause,
    );
    const contentWithRating = await Promise.all(
      contentList.map(async (content) => {
        const averageRating = await this.reviewService.getAverageRating(
          content.id,
        );
        return { ...content, ...averageRating };
      }),
    );
    return contentWithRating;
  }
  async getContentById(id: string) {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: {
        Movie: true,
        Series: { include: { seasons: { include: { episodes: true } } } },
        genres: true,
      },
    });
    if (!content) throw new Error('Content not found');
    let result = { ...content } as any;
    if (content.Movie && content.Movie.length > 0) {
      result.Movie = content.Movie[0];
    } else {
      delete result.Movie;
    }
    if (content.Series && content.Series.length > 0) {
      result.Series = content.Series[0];
    } else {
      delete result.Series;
    }
    const averageRating = await this.reviewService.getAverageRating(id);
    return { ...result, ...averageRating };
  }
  async createContent(dto: CreateContentDto, poster) {
    const posterPath = this.fileService.createFile(FileType.POSTER, poster);
    const content = await this.prisma.content.create({
      data: { ...dto, posterUrl: posterPath },
    });
    return content;
  }
  async updateContent(id: string, dto: UpdateContentDto, poster) {
    if (!id) throw new Error('Content id is required');
    const availableContent = await this.prisma.content.findUnique({
      where: { id },
    });
    if (!availableContent) throw new Error('Content not found');
    if (poster) {
      this.fileService.removeFile(availableContent.posterUrl);
      const posterPath = this.fileService.createFile(FileType.POSTER, poster);
      const content = await this.prisma.content.update({
        where: { id },
        data: { ...dto, posterUrl: posterPath },
      });
      return content;
    }
    const content = await this.prisma.content.update({
      where: { id },
      data: { ...dto },
    });
    return content;
  }
  async deleteContent(id: string) {
    if (!id) throw new Error('Content id is required');
    const availableContent = await this.prisma.content.findUnique({
      where: { id },
      include: {
        Movie: {
          include: { videos: true },
        },
        Series: {
          include: {
            seasons: { include: { episodes: { include: { videos: true } } } },
          },
        },
        trailer: true,
      },
    });
    if (!availableContent) throw new Error('Content not found');
    this.fileService.removeFile(availableContent.posterUrl);
    availableContent.trailer.map((item) =>
      this.fileService.removeFile(item.videoUrl),
    );
    if (availableContent.Movie && availableContent.Movie.length > 0) {
      availableContent.Movie[0].videos.map((item) =>
        this.fileService.removeFile(item.videoUrl),
      );
    }
    if (availableContent.Series && availableContent.Movie.length > 0) {
      availableContent.Series[0].seasons.map((season) => {
        season.episodes.map((episode) => {
          this.fileService.removeFile(episode.posterUrl),
            episode.videos.map((item) =>
              this.fileService.removeFile(item.videoUrl),
            );
        });
      });
    }
    const content = await this.prisma.content.delete({ where: { id } });
    return content;
  }
}
