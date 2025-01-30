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
import { MoviesService } from './movies.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  CreateMovieVideoDto,
  UpdateMovieDto,
  UpdateMovieVideoDto,
} from './dto/movies.dto';
import { Response } from 'express';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('movie')
export class MoviesController {
  constructor(private moviesService: MoviesService) {}
  @Get('all')
  async getMovies() {
    return this.moviesService.getMovies();
  }

  @Post('video/create')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileFieldsInterceptor([{ name: 'movie', maxCount: 1 }]))
  async createMovieVideo(
    @Body() body: CreateMovieVideoDto,
    @UploadedFiles() file,
  ) {
    const video = file.movie ? file.movie[0] : null;
    return this.moviesService.createMovieVideo(
      body.movieId,
      video,
      body.qualityName,
    );
  }
  @Get('video/:movieId')
  async getMovieVideo(
    @Param('movieId') movieId: string,
    @Query('qualityName')
    qualityName: '144p' | '240p' | '360p' | '480p' | '720p' | '1080p',
    @Headers('range') range: string,
    @Res() res: Response,
  ) {
    if (!qualityName) {
      throw new BadRequestException('Quality name not provided');
    }
    const { stream, headers } = await this.moviesService.getMovieVideo(
      movieId,
      qualityName,
      range,
    );
    res.writeHead(206, headers);
    stream.pipe(res);
  }
  @Post('create')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  async createMovie(@Body('contentId') contentId: string) {
    return this.moviesService.createMovie(contentId);
  }
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  async deleteMovie(@Param('id') id: string) {
    return this.moviesService.deleteMovie(id);
  }
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete('video/:id')
  async deleteMovieVideo(@Param('videoId') videoId: string) {
    return this.moviesService.deleteMovieVideo(videoId);
  }
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id')
  async updateMovie(
    @Param('id') movieId: string,
    @Body() body: UpdateMovieDto,
  ) {
    return this.moviesService.updateMovie(movieId, body);
  }
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id')
  async updateMovieVideo(
    @Param('id') movieVideoId: string,
    @Body() body: UpdateMovieVideoDto,
  ) {
    return this.moviesService.updateMovieVideo(movieVideoId, body);
  }
  @Get(':id')
  async getMovie(@Param('id') id: string) {
    return this.moviesService.getMovie(id);
  }
  @Get('video/qualities/:id')
  async getMovieQualities(@Param('id') movieId: string) {
    return this.moviesService.getMovieQualities(movieId);
  }
}
