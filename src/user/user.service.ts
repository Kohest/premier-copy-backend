import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserDto } from './dto/user.dto';
import { hash } from 'argon2';
import { IUserProfile } from './types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  getById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        subscriptions: {
          include: { uniqueSubscription: true },
        },
      },
    });
  }
  getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        subscriptions: {
          include: { uniqueSubscription: true },
        },
      },
    });
  }
  async getProfile(id: string): Promise<IUserProfile> {
    const profile = await this.getById(id);
    const { password, ...profileWithoutPassword } = profile;
    return profileWithoutPassword;
  }
  async create(dto: UserDto) {
    const user = {
      email: dto.email,
      name: dto.name,
      avatar:
        'https://fb-cdn.premier.one/files/premier/upload/35fb/0d11/35fb0d11ea884908e482780920e34f71.png?size=152&quality=100',
      password: await hash(dto.password),
    };
    return this.prisma.user.create({
      data: user,
      include: { subscriptions: true },
    });
  }
  async update(id: string, dto: UserDto) {
    const user: any = {};

    if (dto.email) user.email = dto.email;
    if (dto.name) user.name = dto.name;
    if (dto.avatar) user.avatar = dto.avatar;
    if (dto.password) {
      user.password = await hash(dto.password);
    }
    return this.prisma.user.update({
      where: {
        id,
      },
      data: user,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        avatar: true,
      },
    });
  }
}
