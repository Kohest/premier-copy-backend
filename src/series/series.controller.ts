import { JwtAuthGuard } from './../auth/guards/jwt.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Res,
  SetMetadata,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SeriesService } from './series.service';
import {
  CreateEpisodeDto,
  CreateEpisodeVideoDto,
  UpdateEpisodeDto,
} from './dto/episode.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { RoleGuard } from 'src/auth/guards/role.guard';

@Controller('series')
export class SeriesController {
  constructor(private seriesService: SeriesService) {}
  @Get('all')
  async getAllSeries() {
    return this.seriesService.getAllSeries();
  }

  @Get(':id')
  async getSeriesById(@Param('id') id: string) {
    return this.seriesService.getSeriesById(id);
  }
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @Post('add')
  async createSeries(@Body() body: { contentId: string }) {
    return this.seriesService.createSeries(body.contentId);
  }
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @Post('season/add')
  async createSeason(@Body() body: { seriesId: string; number: number }) {
    return this.seriesService.createSeason(body);
  }
  @Post('episode/add')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileFieldsInterceptor([{ name: 'series' }]))
  async createEpisodeVideo(
    @Body() body: CreateEpisodeVideoDto,
    @UploadedFiles() file,
  ) {
    const series = file.series ? file.series[0] : null;
    return this.seriesService.createEpisodeVideo(body, series);
  }
  @Delete('episode/:id')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteEpisode(@Param('id') id: string) {
    return this.seriesService.deleteEpisode(id);
  }
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete('episode/video/:id')
  async deleteEpisodeVideo(@Param('videoId') videoId: string) {
    return this.seriesService.deleteEpisodeVideo(videoId);
  }
  @Delete('season/:id')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteSeason(@Param('id') id: string) {
    return this.seriesService.deleteSeason(id);
  }
  @Get('video/:id')
  async getEpisodes(
    @Param('id') episodeId: string,
    @Query('qualityName')
    qualityName: '144p' | '240p' | '360p' | '480p' | '720p' | '1080p',
    @Headers('range') range: string,
    @Res() res: Response,
    // @CurrentUser('id') userId: string,
  ) {
    if (!qualityName) {
      throw new BadRequestException('Quality name not provided');
    }
    const { stream, headers } = await this.seriesService.getEpisodeVideoContent(
      episodeId,
      qualityName,
      range,
      // userId,
    );
    res.writeHead(206, headers);
    stream.pipe(res);
  }
  @Post('episode')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'posterImage', maxCount: 1 }]),
  )
  async createEpisode(dto: CreateEpisodeDto, @UploadedFiles() files) {
    const posterImage = files[0].posterImage ? files[0].posterImage[0] : null;
    return this.seriesService.createEpisode(dto, posterImage);
  }
  @Patch('episode/:id')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  async updateEpisode(@Param('id') id: string, @Body() body: UpdateEpisodeDto) {
    return this.seriesService.updateEpisode(body, id);
  }
  @Patch('season/:id')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  async updateSeason(@Param('id') id: string, @Body() number: number) {
    return this.seriesService.updateSeason(id, { number });
  }
  @Get('video/qualities/:id')
  async getEpisodeQualities(@Param('id') episodeId: string) {
    return this.seriesService.getEpisodeVideoQualities(episodeId);
  }
  @Delete(':id')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteSeries(@Param('id') id: string) {
    return this.seriesService.deleteSeries(id);
  }
}
