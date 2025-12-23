import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginUserDto) {
    const user = await this.validateUser(loginDto);
    return this.generateToken(user);
  }

  private generateToken(user: Prisma.UserGetPayload<{ include: { roles: true } }>) {
    const payload = {
      id: user.userId,
      email: user.email,
      username: user.username,
      roles: user.roles,
    };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  private async validateUser(loginDto: LoginUserDto) {
    const user = await this.userService.getUserByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Неправильно введен email или пароль');
    }
    const passwordEquals = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordEquals) {
      throw new UnauthorizedException('Неправильно введен email или пароль');
    }
    return user;
  }
}
