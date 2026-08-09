import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { DeviceType } from 'src/generated/prisma/enums';

export class LoginRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsNotEmpty()
  deviceId?: string;

  @IsOptional()
  @IsNotEmpty()
  deviceToken?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;
}
