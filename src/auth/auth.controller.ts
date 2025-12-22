import { Body, Controller, Post } from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { AuthService } from './auth.service';

@Controller('admin/auth')
export class AuthController {

    constructor(private authService: AuthService){}

    @Post()
    login(@Body() userDto: LoginUserDto){
        return this.authService.login(userDto)
    }

    // @Post('/registration')
    // registration(@Body() userDto: CreateUserDto){
    //     return this.authService.registration(userDto)
    // }
}
