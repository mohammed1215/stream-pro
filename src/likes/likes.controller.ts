import { Controller, Post, Param, Delete, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from 'src/user/guards/AuthGuard';
import { User } from 'src/decorators/user-decorator';
import { JwtUserPayload } from 'src/user/user.service';
// import { UpdateLikeDto } from './dto/update-like.dto';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':videoId')
  @UseGuards(AuthGuard)
  async createLike(
    @Param('videoId') videoId: string,
    @User() user: JwtUserPayload,
  ) {
    const like = await this.likesService.createLike(user.userId, videoId);
    return {
      message: 'Like created successfully',
      like,
    };
  }

  // @Get()
  // findAll() {
  //   return this.likesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.likesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto) {
  //   return this.likesService.update(+id, updateLikeDto);
  // }

  @Delete(':likeId')
  @UseGuards(AuthGuard)
  async remove(@Param('likeId') likeId: string, @User() user: JwtUserPayload) {
    const like = await this.likesService.removeLike(user.userId, likeId);
    return {
      message: 'Like removed successfully',
      like,
    };
  }
}
