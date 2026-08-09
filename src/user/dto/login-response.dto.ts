export class LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };

  constructor(
    accessToken: string,
    user: { id: string; email: string; name: string; avatarUrl: string | null },
  ) {
    this.accessToken = accessToken;
    this.user = user;
  }
}
