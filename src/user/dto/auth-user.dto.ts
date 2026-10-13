import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ example: 'cuid-uuid' })
  id!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  avatarUrl!: string | null;
}
