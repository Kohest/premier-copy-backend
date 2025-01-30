import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentService } from 'src/payment/payment.service';
import { CheckPaymentAndAssignSubscriptionDto } from './dto/subscription.dto';
import { PrismaService } from 'src/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IFullUserSubscription, IUniqueSubscription } from './types';
import { PaymentStatus } from '@prisma/client';
import { CreateUniqueSubscriptionDto } from './dto/unique.subscriotion.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}
  private async getPendingPayments() {
    return this.prisma.payment.findMany({
      where: { status: PaymentStatus.pending },
    });
  }
  async getUserSubscriptions(userId: string): Promise<IFullUserSubscription[]> {
    if (!userId) throw new BadRequestException('userId required');
    const user = this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('user not found');
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { uniqueSubscription: true },
    });
  }
  async checkPaymentAndAssignSubscription(
    dto: CheckPaymentAndAssignSubscriptionDto,
    userId: string,
  ): Promise<{ success: boolean; subscriptionId?: string }> {
    if (!userId) throw new BadRequestException('userId required');
    const user = this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('user not found');
    try {
      const data = await this.paymentService.checkPayment({
        paymentId: dto.paymentId,
      });
      if (data.status === 'succeeded') {
        const subscription = await this.assignSubscription(
          userId,
          dto.uniqueSubscriptionId,
        );
        return { success: true, subscriptionId: subscription.id };
      }
      return { success: false };
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
  async getSubscriptionByType(
    type: string = 'premier',
  ): Promise<IUniqueSubscription[]> {
    const typeLowercase = type.toLowerCase();
    return this.prisma.uniqueSubscription.findMany({
      where: { type: typeLowercase },
    });
  }
  private async assignSubscription(
    userId: string,
    uniqueSubscriptionId: string,
  ) {
    if (!userId || !uniqueSubscriptionId) {
      throw new BadRequestException('userId and uniqueSubscriptionId required');
    }

    const today = new Date();
    const subscriptionEndDate = new Date(today);

    const uniqueSubscription = await this.prisma.uniqueSubscription.findUnique({
      where: {
        id: uniqueSubscriptionId,
      },
    });
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId: userId,
        uniqueSubscription: {
          type: uniqueSubscription.type,
        },
      },
    });
    if (existingSubscription) {
      return this.prisma.subscription.update({
        where: {
          id: existingSubscription.id,
        },
        data: {
          endDate: new Date(
            existingSubscription.endDate.setDate(
              existingSubscription.endDate.getDate() +
                uniqueSubscription.durationDays,
            ),
          ),
        },
      });
    }
    subscriptionEndDate.setDate(
      today.getDate() + uniqueSubscription.durationDays,
    );
    return this.prisma.subscription.create({
      data: {
        userId,
        uniqueSubscriptionId,
        endDate: subscriptionEndDate,
      },
    });
  }
  async cancelSubscription(subscriptionId: string) {
    if (!subscriptionId) {
      throw new BadRequestException('subscriptionId required');
    }

    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!existingSubscription) {
      throw new NotFoundException(
        `Subscription with ID ${subscriptionId} does not exist`,
      );
    }

    return this.prisma.subscription.delete({
      where: { id: subscriptionId },
    });
  }
  async createUniqueSubscription(dto: CreateUniqueSubscriptionDto) {
    return this.prisma.uniqueSubscription.create({ data: dto });
  }
  async deleteUniqueSubscription(id: string) {
    if (!id) throw new BadRequestException('id required');
    const subscription = await this.prisma.uniqueSubscription.findUnique({
      where: { id },
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} does not exist`);
    }
    return this.prisma.uniqueSubscription.delete({ where: { id } });
  }
  @Cron('0 0 * * *')
  async cleanupExpiredSubscriptions() {
    const today = new Date();
    await this.prisma.subscription.deleteMany({
      where: { endDate: { lt: today } },
    });
  }
  @Cron(CronExpression.EVERY_MINUTE)
  async processPendingPayments() {
    const pendingPayments = await this.getPendingPayments();
    for (const payment of pendingPayments) {
      try {
        const updatedStatus = await this.paymentService.checkPayment({
          paymentId: payment.transactionId,
        });
        if (updatedStatus.status === 'succeeded') {
          await this.checkPaymentAndAssignSubscription(
            {
              paymentId: payment.transactionId,
              uniqueSubscriptionId: payment.uniqueSubscriptionId,
            },
            payment.userId,
          );
          await this.prisma.payment.delete({ where: { id: payment.id } });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}
