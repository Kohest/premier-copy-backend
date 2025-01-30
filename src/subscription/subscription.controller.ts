import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  SetMetadata,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CheckPaymentAndAssignSubscriptionDto } from './dto/subscription.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CreateUniqueSubscriptionDto } from './dto/unique.subscriotion.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}
  @Auth()
  @Post('assign')
  @UsePipes(new ValidationPipe())
  async checkPaymentAndAssignSubscription(
    @CurrentUser('id') userId: string,
    @Body()
    dto: CheckPaymentAndAssignSubscriptionDto,
  ) {
    return this.subscriptionService.checkPaymentAndAssignSubscription(
      dto,
      userId,
    );
  }
  @Get('user')
  @Auth()
  async getUserSubscriptions(@CurrentUser('id') userId: string) {
    return this.subscriptionService.getUserSubscriptions(userId);
  }
  @Get('list')
  async getSubscriptionByType(@Query('type') type: string) {
    return this.subscriptionService.getSubscriptionByType(type);
  }
  @Post('/unique/create')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  async createUniqueSubscription(dto: CreateUniqueSubscriptionDto) {
    return this.subscriptionService.createUniqueSubscription(dto);
  }
  @Post('/unique/delete/:id')
  @SetMetadata('role', 'admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  async deleteUniqueSubscription(@Param('id') id: string) {
    return this.subscriptionService.deleteUniqueSubscription(id);
  }
  @Delete('cancel/:id')
  @Auth()
  async cancelSubscription(@Param('id') subscriptionId: string) {
    return this.subscriptionService.cancelSubscription(subscriptionId);
  }
}
