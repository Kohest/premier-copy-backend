import { PartialType } from '@nestjs/mapped-types';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @MinLength(4, { message: 'Name must be 4 characters long' })
  @MaxLength(20, { message: 'Name must be 20 characters long' })
  name: string;
  @IsString()
  @MinLength(20, { message: 'Description must be 4 characters long' })
  @MaxLength(500, { message: 'Description must be 500 characters long' })
  description: string;
}
export class updateCollectionDto extends PartialType(CreateCollectionDto) {}
