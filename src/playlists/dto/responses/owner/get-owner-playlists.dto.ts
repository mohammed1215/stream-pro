export class PlaylistOwnerResponseDto {
  videos!: {
    id: string;
    thumbnailUrl: string | null;
  }[];
  videoCount!: number;
  id!: string;
  title!: string;
  description!: string | null;
  isPublic!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
