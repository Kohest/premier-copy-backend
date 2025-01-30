import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [PaymentController],
  providers: [PaymentService, ConfigService, PrismaService],
})
export class PaymentModule {}
