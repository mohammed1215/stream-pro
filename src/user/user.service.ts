import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repositories/user.repository';
import bcrypt from 'bcrypt';
import { LoginRequestDto } from './dto/login-request.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { instanceToPlain } from 'class-transformer';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

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
    const newUser = await this.userRepo.create({ ...createUserDto, password });

    //create watchlater list

    //return response
    return newUser;
  }

  async login(loginDto: LoginRequestDto) {
    const { email, password } = loginDto;
    //check if email is used or not
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundException('no user found');
    }

    //check if user password is correct
    const result = await bcrypt.compare(password, user.password);

    // if not correct
    if (!result) {
      throw new BadRequestException('password is incorrect');
    }

    //generate jwt refresh token
    // generate jwt access token
    const jwtPayload = new JwtUserPayload(user.id, user.email, user.name);
    const accessToken = await this.jwtService.signAsync(
      instanceToPlain(jwtPayload),
    );
    const refreshToken = await this.jwtService.signAsync(
      instanceToPlain(jwtPayload),
      {
        secret: this.config.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: '30d',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
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
}

export class JwtUserPayload {
  constructor(
    public userId: string,
    public email: string,
    public name: string,
  ) {}
}
