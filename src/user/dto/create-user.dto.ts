import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { DeviceType } from '../../generated/prisma/browser';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
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
