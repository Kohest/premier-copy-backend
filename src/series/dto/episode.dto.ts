import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEpisodeVideoDto {
  @IsString()
  qualityName: string;
  @IsString()
  episodeId: string;
}
export class UpdateEpisodeDto {
  @IsOptional()
  @IsString()
  @MinLength(4, { message: 'Title must be 4 characters long' })
  @MaxLength(20, { message: 'Title must be 20 characters long' })
  title: string;
  @IsOptional()
  @IsNumber()
  @MinLength(4, { message: 'Number must be 4 characters long' })
  @MaxLength(4, { message: 'Number must be 4 characters long' })
  number: number;
  @IsOptional()
  @IsBoolean()
  isFree: boolean;
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must be 500 characters long' })
  description: string;
  @IsOptional()
  @IsString()
  duration: string;
  @IsOptional()
  @IsString()
  seasonId: string;
}
export class CreateEpisodeDto {
  @IsString()
  @MinLength(4, { message: 'Title must be 4 characters long' })
  @MaxLength(20, { message: 'Title must be 20 characters long' })
  title: string;
  @IsNumber()
  @IsNotEmpty()
  number: number;
  @IsBoolean()
  @IsNotEmpty()
  isFree: boolean;
  @IsString()
  @MinLength(4, { message: 'Description must be 4 characters long' })
  @MaxLength(500, { message: 'Description must be 500 characters long' })
  description: string;
  @IsString()
  @IsNotEmpty()
  duration: string;
  @IsString()
  @IsNotEmpty()
  seasonId: string;
}
