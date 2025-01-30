import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTrailerDto {
  @IsString()
  @IsNotEmpty()
  qualityName: string;
  @IsString()
  @IsNotEmpty()
  contentId: string;
}
