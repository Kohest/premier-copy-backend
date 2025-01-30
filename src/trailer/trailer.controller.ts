import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
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
import { TrailerService } from './trailer.service';
import { Response } from 'express';
import { CreateTrailerDto } from './dto/trailer.dto';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('trailer')
export class TrailerController {
  constructor(private readonly trailerService: TrailerService) {}

  @Get('video/:id')
  async getTrailer(
    @Param('contentId') contentId: string,
    @Query('qualityName')
    qualityName: '144p' | '240p' | '360p' | '480p' | '720p' | '1080p',
    @Headers('range') range: string,
    @Res() res: Response,
  ) {
    if (!qualityName)
      throw new BadRequestException('Quality name not provided');
    const { stream, headers } = await this.trailerService.getTrailerVideo(
      contentId,
      qualityName,
      range,
    );
    res.writeHead(206, headers);
    stream.pipe(res);
  }

  @Get('qualities/:id')
  async getTrailerQualities(@Param('id') contentId: string) {
    return this.trailerService.getTrailerQualities(contentId);
  }
  @Post('create')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'trailerVideo', maxCount: 1 }]),
  )
  @UsePipes(new ValidationPipe())
  async createTrailer(@Body() dto: CreateTrailerDto, @UploadedFiles() files) {
    const trailerVideo = files[0].trailerVideo ? files[0].trailerVideo : null;
    return this.trailerService.createTrailer(dto, trailerVideo);
  }
  @Delete(':id')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteTrailer(@Param('id') id: string) {
    return this.trailerService.deleteTrailer(id);
  }
}
