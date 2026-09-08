export class ProfileDataDto {
  id!: string;
  email!: string;
  name!: string;
  avatarUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  totalViews!: number;
  videoCount!: number;
}

export class ProfileResponseDto {
  id!: string;
  email!: string;
  name!: string;
  avatarUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  totalViews!: number;
}

export class SuccessProfileResponseDto {
  success!: boolean;
  data!: ProfileDataDto;
  meta!: {};
}
