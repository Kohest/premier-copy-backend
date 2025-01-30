import { PartialType } from '@nestjs/mapped-types';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGenreDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  name: string;
}
export class UpdateGenreDto extends PartialType(CreateGenreDto) {}
