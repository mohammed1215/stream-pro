import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileDataDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  email!: string;
  @ApiProperty()
  name!: string;
  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;
  @ApiProperty()
  createdAt!: Date;
  @ApiProperty()
  updatedAt!: Date;
  @ApiProperty({ example: 120 })
  totalViews!: number;
  @ApiProperty({ example: 5 })
  videoCount!: number;
}

export class ProfileResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  email!: string;
  @ApiProperty()
  name!: string;
  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;
  @ApiProperty()
  createdAt!: Date;
  @ApiProperty()
  updatedAt!: Date;
  @ApiProperty({ example: 120 })
  totalViews!: number;
  @ApiProperty({ example: 5 })
  videoCount!: number;
}

export class SuccessProfileResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;
  @ApiProperty({ type: () => ProfileDataDto })
  data!: ProfileDataDto;
  @ApiProperty({ type: () => Object })
  meta!: {};
}

export class UpdateProfileResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  email!: string;
  @ApiProperty()
  name!: string;
  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;
  @ApiProperty()
  createdAt!: Date;
  @ApiProperty()
  updatedAt!: Date;
}
