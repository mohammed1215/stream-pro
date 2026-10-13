import { ApiProperty } from '@nestjs/swagger';
import { AuthUserDto } from './auth-user.dto';

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken!: string;

  @ApiProperty({ type: () => AuthUserDto })
  user!: AuthUserDto;

  constructor(
    accessToken: string,
    user: { id: string; email: string; name: string; avatarUrl: string | null },
  ) {
    this.accessToken = accessToken;
    this.user = user;
  }
}
