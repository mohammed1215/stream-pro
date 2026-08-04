import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  description!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;
}
