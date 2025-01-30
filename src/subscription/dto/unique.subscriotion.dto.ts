import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUniqueSubscriptionDto {
  @IsNumber()
  @IsNotEmpty()
  durationDays: number;
  @IsNumber()
  @IsNotEmpty()
  price: number;
  @IsString()
  @IsNotEmpty()
  image: string;
  @IsNumber()
  @IsNotEmpty()
  salePercent: number;
  @IsString()
  @IsNotEmpty()
  type: string;
}
