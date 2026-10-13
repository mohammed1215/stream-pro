import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType } from '../../generated/prisma/enums';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'john@example.com', format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Aa1!aaaa', minLength: 8 })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({
    example: 'device-uuid-123',
    description: 'Client-generated stable device id. Omit for web incognito.',
  })
  @IsOptional()
  @IsNotEmpty()
  deviceId?: string;

  @ApiPropertyOptional({
    example: 'fcm-push-token',
    description: 'FCM push token, not the session id.',
  })
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
