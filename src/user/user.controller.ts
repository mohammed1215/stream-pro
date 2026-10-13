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
import { LoginRequestDto } from './dto/login-request.dto';
import { SuccessResponseShape } from '../user/dto/ResponseShape.dto';
import { Request, type Response } from 'express';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { AuthGuard } from './guards/AuthGuard';
import { User } from '../decorators/user-decorator';
import {
  ProfileResponseDto,
  UpdateProfileResponseDto,
} from './dto/profile-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiSuccessArrayResponse,
  ApiSuccessResponse,
} from '../decorators/api-success-response-decorator';
import { GoogleLoginRequestDto } from './dto/google-login-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { extractIpAndUserAgentAndLocation } from '../utils/extractIpAndUserAgent.util';
import {
  BatchResultDto,
  MessageResponseDto,
  RefreshResponseDto,
  SessionResponseDto,
} from './dto/session-response.dto';
import { AuthUserDto } from './dto/auth-user.dto';

@Controller('')
@ApiTags('Auth & User')
@ApiExtraModels(
  SuccessResponseShape,
  RegisterResponseDto,
  ProfileResponseDto,
  UpdateProfileResponseDto,
  LoginResponseDto,
  SessionResponseDto,
  RefreshResponseDto,
  MessageResponseDto,
  BatchResultDto,
  AuthUserDto,
)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // =========================== Auth =========================

  @Post('auth/register')
  @ApiOperation({ summary: 'Register with email/password. Sets refreshToken cookie.' })
  @ApiBody({ type: CreateUserDto })
  @ApiSuccessResponse(RegisterResponseDto)
  @ApiResponse({ status: 409, description: 'Email already registered.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async register(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SuccessResponseShape<RegisterResponseDto>> {
    const { ip, userAgent, city, country } =
      extractIpAndUserAgentAndLocation(req);
    const data = await this.userService.register(createUserDto, userAgent, {
      ip,
      city,
      country,
    });
    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return new SuccessResponseShape<RegisterResponseDto>(data);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Login. Sets refreshToken cookie. Body omits refreshToken.' })
  @ApiBody({ type: LoginRequestDto })
  @ApiSuccessResponse(LoginResponseDto)
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginRequestDto,
  ) {
    const { ip, userAgent, city, country } =
      extractIpAndUserAgentAndLocation(req);
    const data = await this.userService.login(loginDto, userAgent, {
      ip,
      city,
      country,
    });
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
  @ApiOperation({ summary: 'Google login. Sets refreshToken cookie.' })
  @ApiBody({ type: GoogleLoginRequestDto })
  @ApiSuccessResponse(LoginResponseDto)
  @ApiResponse({ status: 401, description: 'Invalid Google token.' })
  @ApiResponse({ status: 409, description: 'Email already registered with password.' })
  async googleLogin(
    @Body() googleLoginDto: GoogleLoginRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { ip, userAgent, city, country } =
      extractIpAndUserAgentAndLocation(req);
    const data = await this.userService.googleLogin(
      googleLoginDto.token,
      {
        deviceToken: googleLoginDto.deviceToken,
        appVersion: googleLoginDto.appVersion,
        deviceId: googleLoginDto.deviceId,
        deviceName: googleLoginDto.deviceName,
        deviceType: googleLoginDto.deviceType,
        userAgent,
      },
      { city, country, ip },
    );
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
  @ApiOperation({ summary: 'Get own profile with videoCount/totalViews.' })
  @ApiSuccessResponse(ProfileResponseDto)
  @ApiResponse({ status: 404, description: 'Profile or channel not found.' })
  async getProfile(@User() user: JwtUserPayload) {
    const data = await this.userService.getProfile(user.userId);
    if (!data) throw new NotFoundException('Profile Not Found');
    return new SuccessResponseShape<ProfileResponseDto>(data);
  }

  // =========================== Profile =========================

  @Post('auth/logout')
  @ApiOperation({ summary: 'Logout current session. Clears refreshToken cookie.' })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({ status: 200, description: 'Prisma BatchPayload.', type: BatchResultDto })
  @ApiResponse({ status: 401, description: 'Refresh token not found.' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all sessions (LOGOUT_ALL). Clears cookie.' })
  @ApiResponse({ status: 200, description: 'Prisma BatchPayload.', type: BatchResultDto })
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

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('sessions')
  @ApiOperation({ summary: 'List active sessions. Never exposes tokenHash.' })
  @ApiSuccessArrayResponse(SessionResponseDto)
  async getActiveSessions(@User() user: JwtUserPayload) {
    const sessions = await this.userService.getActiveSessions(user.userId);
    return new SuccessResponseShape(sessions);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get one session by id (not token hash).' })
  @ApiParam({ name: 'sessionId', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Raw session row.', type: SessionResponseDto })
  @ApiResponse({ status: 404, description: 'Session not found/revoked/expired.' })
  async getSession(
    @User() user: JwtUserPayload,
    @Param('sessionId') sessionId: string,
  ) {
    const session = await this.userService.getActiveSession(
      user.userId,
      sessionId,
    );

    return session;
  }
  @ApiCookieAuth('refreshToken')
  @Post('auth/refresh')
  @ApiOperation({ summary: 'Rotate refreshToken cookie. Returns new accessToken.' })
  @ApiResponse({ status: 200, description: 'Raw { accessToken }.', type: RefreshResponseDto })
  @ApiResponse({ status: 404, description: 'Refresh cookie missing.' })
  @ApiResponse({ status: 401, description: 'Invalid/expired/reused token. Reuse revokes all.' })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefreshToken = req.cookies?.refreshToken as string | undefined;
    console.log(oldRefreshToken);
    if (!oldRefreshToken) {
      throw new NotFoundException('Refresh token not found');
    }
    const { ip, userAgent } = extractIpAndUserAgentAndLocation(req);
    const { accessToken, refreshToken: newRefreshToken } =
      await this.userService.refreshToken(oldRefreshToken, ip, userAgent);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return { accessToken };
  }

  @Post('sessions/:sessionId/revoke')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke one session (LOGOUT).' })
  @ApiParam({ name: 'sessionId', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Prisma BatchPayload.', type: BatchResultDto })
  @ApiResponse({ status: 404, description: 'Session not found for user.' })
  revokeSession(
    @User() user: JwtUserPayload,
    @Param('sessionId') sessionId: string,
  ) {
    return this.userService.revokeSession(user.userId, sessionId);
  }

  @ApiConsumes('multipart/form-data')
  @Patch('profile/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update name and/or avatar (3MB jpg/png/webp).' })
  @ApiSuccessResponse(UpdateProfileResponseDto)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
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
    return new SuccessResponseShape<UpdateProfileResponseDto>(
      updatedProfile,
    );
  }

  @Delete('profile/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete account + revoke all sessions.' })
  @ApiResponse({ status: 200, description: 'Raw { message }.', type: MessageResponseDto })
  async deleteAccount(@User() user: JwtUserPayload) {
    await this.userService.deleteAccount(user.userId);
    return { message: 'Account deleted successfully' };
  }
}
