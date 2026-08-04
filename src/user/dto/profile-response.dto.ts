export class ProfileResponseDto {
  public id: string;
  public email: string;
  public name!: string;
  public avatarUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  constructor(id: string, email: string) {
    this.id = id;
    this.email = email;
  }
}
