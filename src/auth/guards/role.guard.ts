import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.get('role', context.getHandler());
    if (!requiredRole) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    if (!userId) {
      throw new ForbiddenException('Пользователь не аутентифицирован');
    }
    const user = await this.userService.getById(userId);
    if (!user) {
      throw new ForbiddenException('Пользователь не найден');
    }
    if (user.role !== 'admin') {
      throw new ForbiddenException('Нет доступа');
    }
    return true;
  }
}
