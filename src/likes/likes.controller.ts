import { Controller, Post, Param, Delete, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from 'src/user/guards/AuthGuard';
import { User } from 'src/decorators/user-decorator';
import { JwtUserPayload } from 'src/user/user.service';
import { ApiBearerAuth } from '@nestjs/swagger';
// import { UpdateLikeDto } from './dto/update-like.dto';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':videoId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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

  @Delete(':videoId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async remove(
    @Param('videoId') videoId: string,
    @User() user: JwtUserPayload,
  ) {
    const like = await this.likesService.removeLike(user.userId, videoId);
    return {
      message: 'Like removed successfully',
      like,
    };
  }
}
