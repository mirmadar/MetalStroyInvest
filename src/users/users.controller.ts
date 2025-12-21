import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Controller, Post, Body, Get, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {

    constructor(private userService: UsersService){}

    @Post()
    // @UsePipes(ValidationPipe)
    create(@Body() userDto: CreateUserDto) {
        return this.userService.createUser(userDto);
    }

    @UseGuards(JwtAuthGuard) // к чему закрываем доступ неавторизованным пользователям
    @Get()
    getAll(){
        return this.userService.getAllUsers();
    }

}
