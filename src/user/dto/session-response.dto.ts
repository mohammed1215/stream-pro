import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthProvider, DeviceType, RevokedReason } from '../../generated/prisma/enums';

// Matches RefreshTokenRepository.findByUserId2 select.
// tokenHash / user relation intentionally excluded.
export class SessionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional({ nullable: true })
  deviceId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  deviceName?: string | null;

  @ApiPropertyOptional({ enum: DeviceType, nullable: true })
  deviceType?: DeviceType | null;

  @ApiPropertyOptional({ nullable: true, description: 'FCM push token' })
  deviceToken?: string | null;

  @ApiPropertyOptional({ nullable: true })
  appVersion?: string | null;

  @ApiPropertyOptional({ nullable: true })
  userAgent?: string | null;

  @ApiPropertyOptional({ nullable: true })
  createdIp?: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastIp?: string | null;

  @ApiPropertyOptional({ nullable: true })
  country?: string | null;

  @ApiPropertyOptional({ nullable: true })
  city?: string | null;

  @ApiProperty()
  isRevoked!: boolean;

  @ApiPropertyOptional({ nullable: true })
  revokedAt?: Date | null;

  @ApiPropertyOptional({ enum: RevokedReason, nullable: true })
  revokedReason?: RevokedReason | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Hash this session rotated from. Single-step chain only.',
  })
  replacedByHash?: string | null;

  @ApiPropertyOptional({ enum: AuthProvider, nullable: true })
  loginMethod?: AuthProvider | null;

  @ApiProperty()
  expiresAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  lastUsedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class RefreshResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken!: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Account deleted successfully' })
  message!: string;
}

export class BatchResultDto {
  @ApiProperty({ example: 3, description: 'Prisma BatchPayload.count' })
  count!: number;
}
