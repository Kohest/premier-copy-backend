import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateMovieVideoDto {
  @IsString()
  movieId: string;
  @IsString()
  qualityName: '360p' | '720p';
}
export class UpdateMovieDto {
  @IsBoolean()
  @IsNotEmpty()
  isFree: boolean;
}
export class UpdateMovieVideoDto {
  @IsString()
  @IsNotEmpty()
  qualityName: string;
}
