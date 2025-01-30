import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { IBanner } from './types';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { FileService } from 'src/file/file.service';

@Injectable()
export class BannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}
  async getById(id: string): Promise<IBanner> {
    return this.prisma.banner.findUnique({ where: { id } });
  }
  async createBanner(dto: CreateBannerDto, posterImage) {
    const content = await this.prisma.content.findUnique({
      where: { id: dto.contentId },
    });
    if (!content) throw new Error('Content not found');
    return this.prisma.banner.create({
      data: { ...dto, image: posterImage },
    });
  }
  async updateBanner(id: string, dto: UpdateBannerDto) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new Error('Banner not found');
    return this.prisma.banner.update({ where: { id }, data: dto });
  }
  async deleteBanner(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new Error('Banner not found');
    this.fileService.removeFile(banner.image);
    return this.prisma.banner.delete({ where: { id } });
  }
}
