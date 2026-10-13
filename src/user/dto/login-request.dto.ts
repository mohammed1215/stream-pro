import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType } from '../../generated/prisma/enums';

export class LoginRequestDto {
  @ApiProperty({ example: 'john@example.com', format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Aa1!aaaa' })
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ example: 'device-uuid-123' })
  @IsOptional()
  @IsNotEmpty()
  deviceId?: string;

  @ApiPropertyOptional({ example: 'fcm-push-token' })
  @IsOptional()
  @IsNotEmpty()
  deviceToken?: string;

  @ApiPropertyOptional({ enum: DeviceType, example: DeviceType.WEB })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;

  @ApiPropertyOptional({ example: 'Chrome on Windows' })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiPropertyOptional({ example: '1.0.0' })
  @IsOptional()
  @IsString()
  appVersion?: string;
}
