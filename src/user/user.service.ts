import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repositories/user.repository';
import bcrypt from 'bcrypt';
import { LoginRequestDto } from './dto/login-request.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { instanceToPlain } from 'class-transformer';
import { FirebaseService } from '../firebase/firbase.service';
import { OAuth2Client } from 'google-auth-library';
import { AuthProvider, DeviceType } from '../generated/prisma/enums';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  private googleClient: OAuth2Client;
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly firebaseService: FirebaseService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {
    this.googleClient = new OAuth2Client(
      config.get('GOOGLE_CLIENT_ID'),
      config.get('GOOGLE_CLIENT_SECRET'),
    );
  }

  // ============================== Auth =============================

  async register(createUserDto: CreateUserDto) {
    //check if email in database
    const { deviceToken, deviceType, deviceId } = createUserDto;

    // hash password
    const password = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.userRepo.create({
      ...createUserDto,
      password,
      provider: AuthProvider.LOCAL,
    });

    //return response
    return this.issueTokensForUser(
      {
        id: newUser.id,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        name: newUser.name,
      },
      { deviceId, deviceToken, deviceType },
    );
  }

  async login(loginDto: LoginRequestDto) {
    const { email, password, deviceId, deviceToken, deviceType } = loginDto;
    //check if email is used or not
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('invalid credentials');
    }

    //check if user password is correct
    if (!user.password) {
      throw new UnauthorizedException('invalid credentials');
    }
    const result = await bcrypt.compare(password, user.password);

    // if not correct

    if (!result) {
      throw new UnauthorizedException('invalid credentials');
    }

    //generate jwt refresh token
    // generate jwt access token
    return this.issueTokensForUser(
      {
        id: user.id,
        email: user.email,
        avatarUrl: user.avatarUrl,
        name: user.name,
      },
      { deviceId, deviceToken, deviceType },
    );
  }

  async verifyGoogleToken(idToken: string) {
    const token = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.config.get('GOOGLE_CLIENT_ID'),
    });

    const payload = token.getPayload();

    if (!payload) {
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!payload.email_verified) {
      throw new UnauthorizedException('Email not verified by Google');
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      googleId: payload.sub,
    };
  }

  async googleLogin(
    token: string,
    deviceInfo?: {
      deviceId?: string | null;
      deviceToken?: string | null;
      deviceType?: DeviceType | null;
    },
  ) {
    const payload = await this.verifyGoogleToken(token);
    if (!payload.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const existingGoogleUser = await this.userRepo.findByGoogleId(
      payload.googleId,
    );

    if (existingGoogleUser) {
      return this.issueTokensForUser(existingGoogleUser, deviceInfo);
    }

    const existingEmailUser = await this.userRepo.findByEmail(payload.email);
    if (existingEmailUser) {
      throw new ConflictException(
        'This email is already registered. Please login with your password instead.',
      );
    }

    const newUser = await this.userRepo.create({
      email: payload.email,
      name: payload.name || 'Google User',
      password: null,
      provider: AuthProvider.GOOGLE,
      googleId: payload.googleId,
      avatarUrl: payload.picture,
    });

    return this.issueTokensForUser(newUser, deviceInfo);
  }
  async checkUserExistsByEmail(email: string) {
    const user = await this.userRepo.findByEmail(email);
    return user ? true : false;
  }

  // ====================== Profile ========================
  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    return user;
  }
  findAll() {
    return;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  // ========================= GENERATE AUTH TOKENS ============================
  async generateAuthToken({ userId, email, name }: JwtUserPayload) {
    const jwtPayload = new JwtUserPayload(userId, email, name);
    const accessToken = await this.generateAccessToken(jwtPayload);
    const refreshToken = this.generateRefreshToken();

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const tokenRecord = await this.refreshTokenRepo.findByToken(tokenHash);

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRecord.isRevoked) {
      await this.refreshTokenRepo.revokeAllForUser(tokenRecord.userId);
      throw new UnauthorizedException(
        'Session invalidated. Please login again.',
      );
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const jwtPayload = new JwtUserPayload(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.name,
    );
    const accessToken = await this.generateAccessToken(jwtPayload);
    const newRefreshToken = this.generateRefreshToken();
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepo.rotateToken(
      tokenRecord.id,
      this.hashToken(newRefreshToken),
      newExpiresAt,
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async issueTokensForUser(
    user: { id: string; email: string; name: string; avatarUrl: string | null },
    deviceInfo?: {
      deviceId?: string | null;
      deviceToken?: string | null;
      deviceType?: DeviceType | null;
    },
  ) {
    const { accessToken, refreshToken } = await this.generateAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    await this.refreshTokenRepo.upsertToken(
      user.id,
      this.hashToken(refreshToken),
      deviceInfo?.deviceToken ?? null,
      deviceInfo?.deviceType ?? null,
      deviceInfo?.deviceId ?? null,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  private generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  private generateAccessToken(payload: JwtUserPayload) {
    return this.jwtService.signAsync(instanceToPlain(payload), {
      expiresIn: '15m',
    });
  }
}

export class JwtUserPayload {
  constructor(
    public userId: string,
    public email: string,
    public name: string,
  ) {}
}
