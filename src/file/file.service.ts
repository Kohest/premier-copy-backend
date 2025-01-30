import * as path from 'path';
import * as fs from 'fs';
import * as uuid from 'uuid';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

export enum FileType {
  MOVIE = 'MOVIE',
  POSTER = 'POSTER',
  EPISODE = 'EPISODE',
  TRAILER = 'TRAILER',
  AVATAR = 'AVATAR',
  EPISODE_POSTER = 'EPISODE_POSTER',
  COLLECTION_POSTER = 'COLLECTION_POSTER',
  ADVERT_BANNER = 'ADVERT_BANNER',
}

@Injectable()
export class FileService {
  private staticPath = path.resolve(__dirname, '..', '..', 'uploads', 'static');

  createFile(type: FileType, file) {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuid.v4()}.${fileExtension}`;
      const filePath = path.join(this.staticPath, type);

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      fs.writeFileSync(path.join(filePath, fileName), file.buffer);
      return `${type}/${fileName}`;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  removeFile(filePath: string) {
    try {
      const fullPath = path.join(this.staticPath, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      } else {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
