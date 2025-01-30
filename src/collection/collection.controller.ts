import {
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
import { CollectionService } from './collection.service';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CreateCollectionDto, updateCollectionDto } from './dto/collection.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}
  @Get('all')
  async getAll(
    @Query('take') take: string = '16',
    @Query('offset') offset: string = '0',
  ) {
    return this.collectionService.getAll(parseInt(take), parseInt(offset));
  }
  @Get(':collectionId')
  async getCollectionContentById(@Param('collectionId') collectionId: string) {
    return this.collectionService.getCollectionContentById(collectionId);
  }
  @Post('create')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'collectionPoster', maxCount: 1 }]),
  )
  async createCollection(@UploadedFiles() files, dto: CreateCollectionDto) {
    const collectionPoster = files.collectionPoster
      ? files.collectionPoster[0]
      : null;
    return this.collectionService.createCollection(dto, collectionPoster);
  }
  @Delete('delete/:id')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteCollection(@Param('id') collectionId: string) {
    return this.collectionService.deleteCollection(collectionId);
  }
  @Patch('update/:id')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'collectionPoster', maxCount: 1 }]),
  )
  async updateCollection(
    @Param('id') collectionId: string,
    dto: updateCollectionDto,
    @UploadedFiles() files,
  ) {
    const collectionPoster = files.collectionPoster
      ? files.collectionPoster[0]
      : null;
    return this.collectionService.updateCollection(
      collectionId,
      dto,
      collectionPoster,
    );
  }
  @Patch(':collectionId/add-content/:contentId')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async addContentToCollection(
    @Param('collectionId') collectionId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.collectionService.addContentToCollection(
      collectionId,
      contentId,
    );
  }
  @Patch(':collectionId/remove-content/:contentId')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async removeContentFromCollection(
    @Param('collectionId') collectionId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.collectionService.removeContentFromCollection(
      collectionId,
      contentId,
    );
  }
}
