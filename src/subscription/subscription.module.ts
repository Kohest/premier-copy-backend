import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PaymentService } from 'src/payment/payment.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    PaymentService,
    PrismaService,
    ConfigService,
    UserService,
  ],
})
export class SubscriptionModule {}
