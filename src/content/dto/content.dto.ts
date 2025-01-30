import { PartialType } from '@nestjs/mapped-types';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContentDto {
  @IsString()
  @MinLength(4, { message: 'Title must be 4 characters long' })
  @MaxLength(20, { message: 'Title must be 20 characters long' })
  title: string;

  @IsString()
  @MaxLength(500, { message: 'Description must be 500 characters long' })
  description: string;
  @IsString()
  @MinLength(4, { message: 'Release year must be 4 characters long' })
  @MaxLength(4, { message: 'Release year must be 4 characters long' })
  releaseYear: string;

  @IsString()
  @MaxLength(5, { message: 'Age rating must be from 1 to 5 characters long' })
  ageRating: string;
}
export class UpdateContentDto extends PartialType(CreateContentDto) {}
