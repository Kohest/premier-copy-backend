import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CheckPaymentDto, MakePaymentDto } from './dto/payment.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}
  @Auth()
  @UsePipes(new ValidationPipe())
  @Post()
  async makePayment(
    @Body() makePaymentDto: MakePaymentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentService.makePayment(makePaymentDto, userId);
  }

  @Auth()
  @UsePipes(new ValidationPipe())
  @Post('info')
  async checkPayment(@Body() checkPayment: CheckPaymentDto) {
    return this.paymentService.checkPayment(checkPayment);
  }
}
