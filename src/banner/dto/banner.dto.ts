import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Title must be 4 characters long' })
  @MaxLength(20, { message: 'Title must be 20 characters long' })
  title: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Subtitle must be 4 characters long' })
  @MaxLength(300, { message: 'Subtitle must be 300 characters long' })
  subtitle: string;
  @IsString()
  @IsNotEmpty()
  contentId: string;
}
export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
