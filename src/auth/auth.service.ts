import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {

    constructor(private userService: UsersService, private jwtService: JwtService){}

    async login(userDto: LoginUserDto){
        const user = await this.validateUser(userDto);
        return this.generateToken(user)
    }

    // async registration(userDto: CreateUserDto){
    //     const candidate = await this.userService.findUserByEmailOrUsername(userDto.email, userDto.username)
    //     if(candidate){
    //         throw new HttpException('Пользователь с таким именем или email уже существует', HttpStatus.BAD_REQUEST)
    //     }
    //     const hashPassword = await bcrypt.hash(userDto.password, 5);
    //     const user = await this.userService.createUser({...userDto, password: hashPassword});
    //     return this.generateToken(user)
    // }


    private async generateToken(user: Prisma.UserGetPayload<{ include: { roles: true } }>) {
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

    private async validateUser(userDto: LoginUserDto){
        const user = await this.userService.getUserByEmail(userDto.email);
        if (!user) {
            throw new UnauthorizedException('Неправильно введен email или пароль');
        }
        const passwordEquals = await bcrypt.compare(userDto.password, user.password);
        if(!passwordEquals){
            throw new UnauthorizedException('Неправильно введен email или пароль');
        }
        return user;
    }

}
