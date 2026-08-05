import { Injectable } from '@nestjs/common';
// import { CreateLikeDto } from './dto/create-like.dto';
// import { UpdateLikeDto } from './dto/update-like.dto';
import { LikeRepository } from './repositories/like.repository';

@Injectable()
export class LikesService {
  constructor(private readonly likeRepository: LikeRepository) {}
  createLike(userId: string, videoId: string) {
    return this.likeRepository.createLike(userId, videoId);
  }

  // findAll() {
  //   return `This action returns all likes`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} like`;
  // }

  // update(id: number, updateLikeDto: UpdateLikeDto) {
  //   return `This action updates a #${id} like`;
  // }

  removeLike(userId: string, likeId: string) {
    return this.likeRepository.removeLike(userId, likeId);
  }
}
