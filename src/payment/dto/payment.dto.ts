import { IsNotEmpty, IsString } from 'class-validator';

export class MakePaymentDto {
  @IsNotEmpty()
  amount: number;
  @IsString()
  @IsNotEmpty()
  uniqueSubscriptionId: string;
}
export class CheckPaymentDto {
  @IsNotEmpty()
  paymentId: string;
}
