import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as uuid from 'uuid';
import { CheckPaymentDto, MakePaymentDto } from './dto/payment.dto';
import { MakePaymentResponse } from './types';
import { PrismaService } from 'src/prisma.service';
import { PaymentStatus } from '@prisma/client';
@Injectable()
export class PaymentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async makePayment(
    makePaymentDto: MakePaymentDto,
    userId: string,
  ): Promise<MakePaymentResponse> {
    try {
      const { data } = await axios({
        method: 'POST',
        url: 'https://api.yookassa.ru/v3/payments',
        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': uuid.v4(),
        },
        auth: {
          username: this.configService.get('YOOKASSA_LOGIN'),
          password: this.configService.get('YOOKASSA_PASSWORD'),
        },
        data: {
          amount: {
            value: makePaymentDto.amount,
            currency: 'RUB',
          },
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: 'http://localhost:5173/order',
          },
          description: 'Подписка',
        },
      });

      await this.prisma.payment.create({
        data: {
          transactionId: data.id,
          userId,
          uniqueSubscriptionId: makePaymentDto.uniqueSubscriptionId,
          amount: makePaymentDto.amount,
          status: PaymentStatus.pending,
        },
      });
      return data;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
  async checkPayment(
    checkPaymentDto: CheckPaymentDto,
  ): Promise<MakePaymentResponse> {
    try {
      const { data } = await axios({
        method: 'GET',
        url: `https://api.yookassa.ru/v3/payments/${checkPaymentDto.paymentId}`,
        auth: {
          username: this.configService.get('YOOKASSA_LOGIN'),
          password: this.configService.get('YOOKASSA_PASSWORD'),
        },
      });
      return data;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
}
