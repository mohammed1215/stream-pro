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
  Req,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { JwtUserPayload, UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { SuccessResponseShape } from '../user/dto/ResponseShape.dto';
import { Request, type Response } from 'express';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { AuthGuard } from './guards/AuthGuard';
import { User } from '../decorators/user-decorator';
import { ProfileResponseDto } from './dto/profile-response.dto';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiExtraModels,
  ApiTags,
} from '@nestjs/swagger';
import { ApiSuccessResponse } from '../decorators/api-success-response-decorator';
import { GoogleLoginRequestDto } from './dto/google-login-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return new SuccessResponseShape<RegisterResponseDto>(data);
  }

  @Post('auth/login')
  @ApiSuccessResponse(LoginResponseDto)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginRequestDto,
  ) {
    const data = await this.userService.login(loginDto);
    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
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
    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
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

  @Post('auth/logout')
  logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    const refreshToken = req.cookies['refreshToken'] as string | undefined;
    return this.userService.logout(refreshToken);
  }

  @Post('auth/logout-all')
  @UseGuards(AuthGuard)
  logoutAll(
    @User() user: JwtUserPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return this.userService.logoutFromAllDevices(user.userId);
  }

  @ApiCookieAuth('refreshToken')
  @Post('auth/refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefreshToken = req.cookies?.refreshToken as string | undefined;
    console.log(oldRefreshToken);
    if (!oldRefreshToken) {
      throw new NotFoundException('Refresh token not found');
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await this.userService.refreshToken(oldRefreshToken);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return { accessToken };
  }

  @Patch('profile/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @User() user: JwtUserPayload,
    @Body() updateUserDto: UpdateProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 3 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    avatarFile?: Express.Multer.File,
  ) {
    const updatedProfile = await this.userService.updateProfile(
      user.userId,
      updateUserDto,
      avatarFile,
    );
    return new SuccessResponseShape<ProfileResponseDto>(updatedProfile);
  }

  @Delete('profile/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async deleteAccount(@User() user: JwtUserPayload) {
    await this.userService.deleteAccount(user.userId);
    return { message: 'Account deleted successfully' };
  }
}
