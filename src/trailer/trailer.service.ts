import { BadRequestException, Injectable } from '@nestjs/common';
import { FileService, FileType } from 'src/file/file.service';
import { PrismaService } from 'src/prisma.service';
import * as path from 'path';
import { createReadStream, existsSync, statSync } from 'fs';
import { CreateTrailerDto } from './dto/trailer.dto';

@Injectable()
export class TrailerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async getTrailerVideo(
    contentId: string,
    qualityName: '144p' | '240p' | '360p' | '480p' | '720p' | '1080p',
    range: string,
  ) {
    const trailer = await this.prisma.contentTrailer.findFirst({
      where: { contentId: contentId, qualityName },
    });
    const videoPath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'static',
      trailer.videoUrl,
    );
    if (!existsSync(videoPath))
      throw new BadRequestException('Video not found');
    const videoStat = statSync(videoPath);
    const videoSize = videoStat.size;
    const CHUNK_SIZE = 1000000;
    if (!range) {
      throw new BadRequestException('Range not provided');
    }
    const match = range.match(/bytes=(\d+)-(\d+)?/);
    if (!match) throw new BadRequestException('Invalid Range');
    const start = parseInt(match[1], 10);
    const end = match[2]
      ? parseInt(match[2], 10)
      : Math.min(start + CHUNK_SIZE, videoSize - 1);
    if (start >= videoSize || end >= videoSize) {
      throw new BadRequestException('Invalid Range');
    }
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

  async getTrailerQualities(
    contentId: string,
  ): Promise<{ qualityName: string }[]> {
    const trailerQualities = await this.prisma.contentTrailer.findMany({
      where: { contentId },
      select: {
        qualityName: true,
      },
    });
    return trailerQualities;
  }
  async createTrailer(dto: CreateTrailerDto, trailerVideo) {
    const content = await this.prisma.content.findUnique({
      where: { id: dto.contentId },
    });
    if (!content) throw new Error('Content not found');
    const videoPath = this.fileService.createFile(
      FileType.TRAILER,
      trailerVideo,
    );
    return this.prisma.contentTrailer.create({
      data: { ...dto, videoUrl: videoPath },
    });
  }
  async deleteTrailer(id: string) {
    const trailer = await this.prisma.contentTrailer.findUnique({
      where: { id },
    });
    if (!trailer) throw new Error('Trailer not found');
    this.fileService.removeFile(trailer.videoUrl);
    return this.prisma.contentTrailer.delete({ where: { id } });
  }
}
