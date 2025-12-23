import { Body, Controller, Post } from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { AuthService } from './auth.service';

@Controller('admin/auth')
export class AuthController {

    constructor(private authService: AuthService){}

    @Post()
    async login(@Body() loginDto: LoginUserDto){
        return this.authService.login(loginDto)
    }
}
