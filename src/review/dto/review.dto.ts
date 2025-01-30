import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class createReviewDto {
  @IsNumber()
  rating: number;
  @IsString()
  @MaxLength(300, { message: 'Comment must be 300 characters long' })
  @MinLength(4, { message: 'Comment must be 4 characters long' })
  @IsOptional()
  comment?: string;
  @IsString()
  contentId: string;
}
