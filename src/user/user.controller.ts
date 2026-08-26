import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtUserPayload, UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { SuccessResponseShape } from '../user/dto/ResponseShape.dto';
import { type Response } from 'express';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { AuthGuard } from './guards/AuthGuard';
import { User } from '../decorators/user-decorator';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '../decorators/api-success-response-decorator';
import { GoogleLoginRequestDto } from './dto/google-login-request.dto';

@Controller('')
@ApiTags('Auth & User')
@ApiExtraModels(
  SuccessResponseShape,
  RegisterResponseDto,
  ProfileResponseDto,
  LoginResponseDto,
)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // =========================== Auth =========================

  @Post('auth/register')
  @ApiSuccessResponse(RegisterResponseDto)
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SuccessResponseShape<RegisterResponseDto>> {
    const data = await this.userService.register(createUserDto);
    res.cookie('refreshToken', data.refreshToken, { httpOnly: true });
    return new SuccessResponseShape<RegisterResponseDto>(data);
  }

  @Post('auth/login')
  @ApiSuccessResponse(LoginResponseDto)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginRequestDto,
  ) {
    const data = await this.userService.login(loginDto);
    res.cookie('refreshToken', data.refreshToken, { httpOnly: true });
    return new SuccessResponseShape<LoginResponseDto>({
      accessToken: data.accessToken,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatarUrl: data.user.avatarUrl,
      },
    });
  }

  @Post('auth/google')
  async googleLogin(
    @Body() googleLoginDto: GoogleLoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.userService.googleLogin(googleLoginDto.token);
    res.cookie('refreshToken', data.refreshToken, { httpOnly: true });
    return new SuccessResponseShape<LoginResponseDto>({
      accessToken: data.accessToken,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatarUrl: data.user.avatarUrl,
      },
    });
  }

  // =========================== Profile =========================
  @Get('profile/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiSuccessResponse(ProfileResponseDto)
  async getProfile(@User() user: JwtUserPayload) {
    const data = await this.userService.getProfile(user.userId);
    if (!data) throw new NotFoundException('Profile Not Found');
    return new SuccessResponseShape<ProfileResponseDto>(data);
  }

  // =========================== Profile =========================

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
