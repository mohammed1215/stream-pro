import { ApiProperty } from '@nestjs/swagger';
import { AuthUserDto } from './auth-user.dto';

export class RegisterResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken!: string;

  @ApiProperty({
    example: 'a3f8c9...128-hex',
    description: 'Also set as httpOnly refreshToken cookie.',
  })
  refreshToken!: string;

  @ApiProperty({ type: () => AuthUserDto })
  user!: AuthUserDto;

  constructor(
    accessToken: string,
    refreshToken: string,
    user: { id: string; email: string; name: string; avatarUrl: string | null },
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}
