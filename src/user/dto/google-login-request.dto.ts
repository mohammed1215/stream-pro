import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DeviceType } from '../../generated/prisma/client';

export class GoogleLoginRequestDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

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
