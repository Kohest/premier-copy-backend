import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(4, { message: '   Name must be 4 characters long' })
  @MaxLength(20, { message: '   Name must be 20 characters long' })
  name: string;
  @MinLength(6, { message: '   Password must be 6 characters long' })
  @IsString()
  password: string;
}
