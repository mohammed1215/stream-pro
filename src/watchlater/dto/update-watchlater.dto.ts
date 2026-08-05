import { PartialType } from '@nestjs/swagger';
import { CreateWatchlaterDto } from './create-watchlater.dto';

export class UpdateWatchlaterDto extends PartialType(CreateWatchlaterDto) {}
