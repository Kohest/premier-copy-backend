import { IsNotEmpty, IsString } from 'class-validator';

export class CheckPaymentAndAssignSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  paymentId: string;
  @IsNotEmpty()
  @IsString()
  uniqueSubscriptionId: string;
}
