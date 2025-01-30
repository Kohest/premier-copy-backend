import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateEpisodeDto,
  CreateEpisodeVideoDto,
  UpdateEpisodeDto,
} from './dto/episode.dto';
import { FileService, FileType } from 'src/file/file.service';
import * as path from 'path';
import { createReadStream, existsSync, statSync } from 'fs';

@Injectable()
export class SeriesService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}
  async getAllSeries() {
    return this.prisma.series.findMany({
      include: { seasons: true },
    });
  }
  async getSeriesById(id: string) {
    return this.prisma.series.findUnique({
      where: { id },
      include: { seasons: true, content: true },
    });
  }
  async createSeries(contentId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!content) throw new BadRequestException('Content not found');

    return this.prisma.series.create({ data: { contentId } });
  }
  async createSeason(body: { seriesId: string; number: number }) {
    if (!body.number) throw new BadRequestException('Number is required');
    const series = await this.prisma.series.findUnique({
      where: { id: body.seriesId },
    });
    if (!series) throw new BadRequestException('Series not found');

    return this.prisma.season.create({
      data: { seriesId: body.seriesId, number: body.number },
    });
  }
  async getEpisodeVideoContent(
    episodeId: string,
    qualityName: '144p' | '240p' | '360p' | '480p' | '720p' | '1080p',
    range: string,
    // userId: string,
  ) {
    // const { isFree } = await this.prisma.episode.findUnique({
    //   where: { id: episodeId },
    //   select: { isFree: true },
    // });
    // if (!userId) throw new BadRequestException('userId required');
    // const user = await this.prisma.user.findUnique({
    //   where: { id: userId },
    //   include: {
    //     subscriptions: true,
    //   },
    // });
    // if (!user) throw new BadRequestException('User not found');
    // if (user.subscriptions.length === 0 && !isFree)
    //   throw new BadRequestException('User is not subscribed');

    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
    });
    if (!episode) {
      console.error(`Episode with id ${episodeId} not found`);
      throw new BadRequestException('Episode not found');
    }
    const video = await this.prisma.episodeVideo.findFirst({
      where: { episodeId, qualityName },
    });
    const videoPath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'static',
      video.videoUrl,
    );

    if (!existsSync(videoPath)) {
      throw new BadRequestException('Video not found');
    }
    const videoStat = statSync(videoPath);

    const videoSize = videoStat.size;
    const CHUNK_SIZE = 5000000;
    if (!range) {
      throw new BadRequestException('Range not provided');
    }
    const match = range.match(/bytes=(\d+)-(\d+)?/);
    if (!match) {
      throw new BadRequestException('Invalid Range header');
    }
    const start = parseInt(match[1], 10);
    const end = match[2]
      ? parseInt(match[2], 10)
      : Math.min(start + CHUNK_SIZE, videoSize - 1);
    if (start >= videoSize || end >= videoSize) {
      throw new BadRequestException('Requested range is beyond file size');
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
  async getEpisodeVideoQualities(episodeId: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
    });
    if (!episode) {
      console.error(`Episode with id ${episodeId} not found`);
      throw new BadRequestException('Episode not found');
    }
    const qualities = await this.prisma.episodeVideo.findMany({
      where: { episodeId },
      select: {
        qualityName: true,
      },
    });
    return qualities;
  }
  async createEpisode(dto: CreateEpisodeDto, posterImage) {
    const posterPath = this.fileService.createFile(
      FileType.EPISODE_POSTER,
      posterImage,
    );
    const season = await this.prisma.season.findUnique({
      where: { id: dto.seasonId },
    });
    if (!season) throw new BadRequestException('Season not found');

    return this.prisma.episode.create({
      data: { ...dto, posterUrl: posterPath },
    });
  }
  async createEpisodeVideo(body: CreateEpisodeVideoDto, series) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: body.episodeId },
    });
    if (!episode) throw new BadRequestException('Episode not found');

    const qualityName = await this.prisma.episodeVideo.findFirst({
      where: { qualityName: body.qualityName, episodeId: body.episodeId },
    });
    if (qualityName) throw new BadRequestException('Episode already exists');

    const episodePath = this.fileService.createFile(FileType.EPISODE, series);
    return this.prisma.episodeVideo.create({
      data: {
        qualityName: body.qualityName,
        episodeId: body.episodeId,
        videoUrl: episodePath,
      },
    });
  }

  async updateSeason(id: string, body: { number: number }) {
    if (!body.number) throw new BadRequestException('Number required');
    const season = await this.prisma.season.findUnique({
      where: { id },
    });
    if (!season) throw new BadRequestException('Season not found');
    return this.prisma.season.update({
      where: { id },
      data: { number: body.number },
    });
  }
  async updateEpisode(dto: UpdateEpisodeDto, episodeId: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
    });
    if (!episode) throw new BadRequestException('Episode not found');
    return this.prisma.episode.update({
      where: { id: episodeId },
      data: {
        title: dto.title,
        number: dto.number,
        isFree: dto.isFree,
        description: dto.description,
        duration: dto.duration,
        seasonId: dto.seasonId,
      },
    });
  }
  async deleteEpisode(id: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id },
      include: {
        videos: true,
      },
    });
    if (!episode) throw new BadRequestException('Episode not found');
    this.fileService.removeFile(episode.posterUrl);
    this.fileService.removeFile(episode.videos[0].videoUrl);
    return this.prisma.episode.delete({ where: { id } });
  }
  async deleteEpisodeVideo(deleteEpisodeVideo: string) {
    const episodeVideo = await this.prisma.episodeVideo.findUnique({
      where: { id: deleteEpisodeVideo },
    });
    if (!episodeVideo) throw new BadRequestException('Episode video not found');
    this.fileService.removeFile(episodeVideo.videoUrl);
    return this.prisma.episodeVideo.delete({
      where: { id: deleteEpisodeVideo },
    });
  }
  async deleteSeason(id: string) {
    const season = await this.prisma.season.findUnique({
      where: { id },
      include: {
        episodes: {
          include: {
            videos: true,
          },
        },
      },
    });
    if (!season) throw new BadRequestException('Season not found');
    season.episodes.map(
      (item) => (
        this.fileService.removeFile(item.videos[0].videoUrl),
        this.fileService.removeFile(item.posterUrl)
      ),
    );
    return this.prisma.season.delete({ where: { id } });
  }
  async deleteSeries(id: string) {
    const series = await this.prisma.series.findUnique({
      where: { id },
      include: {
        seasons: {
          include: {
            episodes: {
              include: {
                videos: true,
              },
            },
          },
        },
      },
    });
    series.seasons.map((item) =>
      item.episodes.map(
        (episode) => (
          this.fileService.removeFile(episode.videos[0].videoUrl),
          this.fileService.removeFile(episode.posterUrl)
        ),
      ),
    );
    if (!series) throw new BadRequestException('Series not found');
    return this.prisma.series.delete({ where: { id } });
  }
}
