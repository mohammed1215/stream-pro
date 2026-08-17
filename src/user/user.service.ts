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
import { FirebaseService } from 'src/firebase/firbase.service';
import { OAuth2Client } from 'google-auth-library';
import { AuthProvider } from 'src/generated/prisma/enums';
import { RegisterResponseDto } from './dto/register-response.dto';
@Injectable()
export class UserService {
  private googleClient: OAuth2Client;
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly firebaseService: FirebaseService,
  ) {
    this.googleClient = new OAuth2Client(
      config.get('GOOGLE_CLIENT_ID'),
      config.get('GOOGLE_CLIENT_SECRET'),
    );
  }

  // ============================== Auth =============================

  async register(createUserDto: CreateUserDto) {
    //check if email in database
    const { email } = createUserDto;
    const user = await this.userRepo.findByEmail(email);
    if (user) {
      throw new ConflictException();
    }

    // hash password
    const password = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.userRepo.create({
      ...createUserDto,
      password,
      provider: AuthProvider.LOCAL,
    });

    //return response
    const { accessToken, refreshToken } = await this.generateAuthToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
      },
    };
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

    // update user's device information
    await this.userRepo.update(user.id, {
      deviceId,
      deviceToken,
      deviceType,
    });

    //generate jwt refresh token
    // generate jwt access token
    const { accessToken, refreshToken } = await this.generateAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
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

  async googleLogin(token: string) {
    const payload = await this.verifyGoogleToken(token);

    if (!payload.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const existingGoogleUser = await this.userRepo.findByGoogleId(
      payload.googleId,
    );

    if (existingGoogleUser) {
      const { accessToken, refreshToken } = await this.generateAuthToken({
        userId: existingGoogleUser.id,
        email: existingGoogleUser.email,
        name: existingGoogleUser.name,
      });
      return {
        accessToken,
        refreshToken,
        user: {
          id: existingGoogleUser.id,
          email: existingGoogleUser.email,
          name: existingGoogleUser.name,
          avatarUrl: existingGoogleUser.avatarUrl,
        },
      };
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
    const { accessToken, refreshToken } = await this.generateAuthToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
      },
    };
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
    const accessToken = await this.jwtService.signAsync(
      instanceToPlain(jwtPayload),
      { expiresIn: '4h' },
    );
    const refreshToken = await this.jwtService.signAsync(
      instanceToPlain(jwtPayload),
      {
        secret: this.config.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: '30d',
      },
    );

    return { accessToken, refreshToken };
  }
}

export class JwtUserPayload {
  constructor(
    public userId: string,
    public email: string,
    public name: string,
  ) {}
}
