import {
  Controller,
  Post,
  Param,
  Delete,
  UseGuards,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from 'src/user/guards/AuthGuard';
import { User } from 'src/decorators/user-decorator';
import { JwtUserPayload } from 'src/user/user.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { LikeResponseDto } from './dto/responses/like-item-response.dto';
// import { UpdateLikeDto } from './dto/update-like.dto';

@Controller('likes')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':videoId')
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

  @Get()
  @ApiOperation({
    summary: 'Get Liked Videos',
    description: 'Get all liked videos of the logged in user',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'last liked video item id from previous page',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default 20)',
  })
  @ApiOkResponse({ type: LikeResponseDto })
  findAllLikedVideos(
    @User() user: JwtUserPayload,
    @Query('cursor') cursor: string,
    @Query(
      'limit',
      new DefaultValuePipe(20),
      new ParseIntPipe({ optional: true }),
    )
    limit: number,
  ) {
    return this.likesService.findAllLikedVideos(user.userId, cursor, limit);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.likesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto) {
  //   return this.likesService.update(+id, updateLikeDto);
  // }

  @Delete(':videoId')
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
