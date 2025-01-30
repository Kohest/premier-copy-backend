import { BadRequestException, Injectable } from '@nestjs/common';
import { createReadStream, existsSync, ReadStream, statSync } from 'fs';
import { join } from 'path';
import { FileService, FileType } from 'src/file/file.service';
import { PrismaService } from 'src/prisma.service';
import { UpdateMovieDto, UpdateMovieVideoDto } from './dto/movies.dto';

@Injectable()
export class MoviesService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}
  async getMovies() {
    return this.prisma.movie.findMany();
  }

  async getMovie(id: string) {
    return this.prisma.movie.findUnique({
      where: { id },
      include: {
        content: true,
      },
    });
  }
  async deleteMovie(movieId: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        videos: {
          select: {
            videoUrl: true,
          },
        },
      },
    });
    if (!movie) throw new BadRequestException('movie not found');
    movie.videos.map((item) => this.fileService.removeFile(item.videoUrl));
    return this.prisma.movie.delete({ where: { id: movieId } });
  }
  async deleteMovieVideo(movieVideoId: string) {
    const video = await this.prisma.movieVideo.findUnique({
      where: { id: movieVideoId },
    });
    if (!video) throw new BadRequestException('movie video not found');
    this.fileService.removeFile(video.videoUrl);
    return this.prisma.movieVideo.delete({ where: { id: movieVideoId } });
  }
  async createMovie(contentId: string) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId },
    });
    if (!content) throw new BadRequestException('Content not found');
    return this.prisma.movie.create({ data: { contentId, isFree: false } });
  }
  async createMovieVideo(movieId: string, video, qualityName) {
    if (!video) throw new BadRequestException('Movie not found');
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });
    if (!movie) throw new BadRequestException('Movie not found');
    const moviePath = this.fileService.createFile(FileType.MOVIE, video);
    return this.prisma.movieVideo.create({
      data: { movieId, videoUrl: moviePath, qualityName },
    });
  }
  async updateMovie(movieId: string, body: UpdateMovieDto) {
    const movie = this.prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) throw new BadRequestException('Movie not found');
    return this.prisma.movie.update({ where: { id: movieId }, data: body });
  }
  async updateMovieVideo(movieVideoId: string, body: UpdateMovieVideoDto) {
    const movie = this.prisma.movieVideo.findUnique({
      where: { id: movieVideoId },
    });
    if (!movie) throw new BadRequestException('Movie video not found');
    return this.prisma.movieVideo.update({
      where: { id: movieVideoId },
      data: body,
    });
  }
  async getMovieVideo(
    movieId: string,
    qualityName: '144p' | '240p' | '360p' | '480p' | '720p' | '1080p',
    range: string,
  ) {
    if (!movieId) throw new BadRequestException('Movie video not found');
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });
    if (!movie) {
      console.error(`Movie with id ${movieId} not found`);
      throw new BadRequestException(`Movie with id ${movieId} not found`);
    }

    const video = await this.prisma.movieVideo.findFirst({
      where: { movieId, qualityName },
    });
    if (!video) {
      throw new BadRequestException('Movie video not found');
    }
    const videoPath = join(process.cwd(), 'uploads', 'static', video.videoUrl);
    const videoStat = statSync(videoPath);
    if (!range) {
      throw new BadRequestException('Range not provided');
    }
    if (!existsSync(videoPath)) {
      throw new BadRequestException('Video file does not exist');
    }
    const videoSize = videoStat.size;
    const CHUNK_SIZE = 10 ** 6; //1MB
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    return {
      stream: createReadStream(videoPath, { start, end }),
      headers: {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': 'video/mp4',
      },
    };
  }
  async getMovieQualities(movieId: string) {
    if (!movieId) throw new BadRequestException('Movie video not found');
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });
    if (!movie) {
      console.error(`Movie with id ${movieId} not found`);
      throw new BadRequestException(`Movie with id ${movieId} not found`);
    }
    const qualities = await this.prisma.movieVideo.findMany({
      where: { movieId },
      select: { qualityName: true },
    });
    return qualities;
  }
}
