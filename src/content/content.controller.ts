import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  SetMetadata,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateContentDto, UpdateContentDto } from './dto/content.dto';
import { ContentType, Country, Genre } from './types/content.types';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('content')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get('all')
  async getContent(
    @Query('count') count: string,
    @Query('offset') offset: string,
    @Query('search') search: string,
    @Query('genre') genre: Genre,
    @Query('country') country: Country,
    @Query('year') year: string,
    @Query('type') type: ContentType,
  ) {
    return this.contentService.getContent(
      parseInt(count),
      parseInt(offset),
      search,
      genre,
      country,
      parseInt(year),
      type,
    );
  }

  @Post('create')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileFieldsInterceptor([{ name: 'poster', maxCount: 1 }]))
  async createContent(@Body() dto: CreateContentDto, @UploadedFiles() files) {
    const poster = files.poster ? files.poster[0] : null;
    return this.contentService.createContent(dto, poster);
  }
  @Get(':contentId')
  async getContentById(@Param('contentId') contentId: string) {
    return this.contentService.getContentById(contentId);
  }

  @Delete('delete/:contentId')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteContent(@Param('contentId') contentId: string) {
    return this.contentService.deleteContent(contentId);
  }

  @Patch('update/:contentId')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileFieldsInterceptor([{ name: 'poster', maxCount: 1 }]))
  async updateContent(
    @Param('contentId') contentId: string,
    @Body() dto: UpdateContentDto,
    @UploadedFiles() files,
  ) {
    const poster = files.poster ? files.poster[0] : null;
    return this.contentService.updateContent(contentId, dto, poster);
  }
}
