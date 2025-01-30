import { JwtAuthGuard } from './../auth/guards/jwt.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  SetMetadata,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}
  @Get('/:id')
  async getById(@Param('id') id: string) {
    return this.bannerService.getById(id);
  }
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'posterImage', maxCount: 1 }]),
  )
  async createBanner(@Body() dto: CreateBannerDto, @UploadedFiles() files) {
    const posterImage = files.posterImage ? files.posterImage[0] : null;
    return this.bannerService.createBanner(dto, posterImage);
  }
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  async updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannerService.updateBanner(id, dto);
  }
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  async deleteBanner(@Param('id') id: string) {
    return this.bannerService.deleteBanner(id);
  }
}
