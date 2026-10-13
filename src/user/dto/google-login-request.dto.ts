import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType } from '../../generated/prisma/enums';

export class GoogleLoginRequestDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIs...',
    description: 'Google ID token from Google Sign-In.',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiPropertyOptional({ example: 'device-uuid-123' })
  @IsOptional()
  @IsNotEmpty()
  deviceId?: string;

  @ApiPropertyOptional({ example: 'fcm-push-token' })
  @IsOptional()
  @IsNotEmpty()
  deviceToken?: string;

  @ApiPropertyOptional({ enum: DeviceType, example: DeviceType.ANDROID })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;

  @ApiPropertyOptional({ example: 'Pixel 8' })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiPropertyOptional({ example: '1.0.0' })
  @IsOptional()
  @IsString()
  appVersion?: string;
}
