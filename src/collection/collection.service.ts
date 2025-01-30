import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  ICollection,
  ICollectionWithContentItem,
} from './types/collection.types';
import { ReviewService } from 'src/review/review.service';
import { CreateCollectionDto, updateCollectionDto } from './dto/collection.dto';
import { FileService, FileType } from 'src/file/file.service';

@Injectable()
export class CollectionService {
  constructor(
    private prisma: PrismaService,
    private reviewService: ReviewService,
    private fileService: FileService,
  ) {}

  async getAll(take: number = 16, offset: number = 0): Promise<ICollection[]> {
    return this.prisma.collection.findMany({ take: take, skip: offset });
  }
  async getCollectionContentById(
    collectionId: string,
  ): Promise<ICollectionWithContentItem> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        contents: {
          include: {
            genres: true,
            Movie: true,
            Series: true,
          },
        },
      },
    });

    if (!collection) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }

    const contentsWithRating = await Promise.all(
      collection.contents.map(async (content) => {
        const avgRating = await this.reviewService.getAverageRating(content.id);
        return {
          ...content,
          averageRating: avgRating.averageRating,
        };
      }),
    );

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      posterUrl: collection.posterUrl,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      //@ts-ignore
      contents: contentsWithRating,
    };
  }
  async createCollection(dto: CreateCollectionDto, collectionPoster: string) {
    if (!collectionPoster) throw new Error('Collection poster is required');
    const posterPath = this.fileService.createFile(
      FileType.COLLECTION_POSTER,
      collectionPoster,
    );
    return this.prisma.collection.create({
      data: { ...dto, posterUrl: posterPath },
    });
  }
  async deleteCollection(collectionId: string) {
    if (!collectionId) throw new Error('Collection id is required');
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }
    this.fileService.removeFile(collection.posterUrl);
    return this.prisma.collection.delete({ where: { id: collectionId } });
  }
  async updateCollection(
    collectionId: string,
    dto: updateCollectionDto,
    poster,
  ) {
    if (!collectionId) throw new Error('Collection id is required');
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }
    if (poster) {
      this.fileService.removeFile(collection.posterUrl);
      const posterPath = this.fileService.createFile(
        FileType.COLLECTION_POSTER,
        poster,
      );
      return this.prisma.collection.update({
        where: { id: collectionId },
        data: { ...dto, posterUrl: posterPath },
      });
    }
    return this.prisma.collection.update({
      where: { id: collectionId },
      data: { ...dto },
    });
  }
  async addContentToCollection(collectionId: string, contentId: string) {
    if (!collectionId) throw new Error('Collection id is required');
    if (!contentId) throw new Error('Content id is required');
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!content) {
      throw new Error(`Content with id ${contentId} not found`);
    }
    return this.prisma.collection.update({
      where: { id: collectionId },
      data: { contents: { connect: { id: contentId } } },
    });
  }
  async removeContentFromCollection(collectionId: string, contentId: string) {
    if (!collectionId) throw new Error('Collection id is required');
    if (!contentId) throw new Error('Content id is required');
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new Error(`Collection with id ${collectionId} not found`);
    }
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!content) {
      throw new Error(`Content with id ${contentId} not found`);
    }
    return this.prisma.collection.update({
      where: { id: collectionId },
      data: {
        contents: {
          disconnect: { id: contentId },
        },
      },
    });
  }
}
