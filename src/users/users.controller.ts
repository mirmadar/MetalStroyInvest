import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Controller, Post, Body, Get, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class UsersController {

    constructor(private userService: UsersService){}

    @Post('/create-admin')
    create(@Body() userDto: CreateUserDto) {
        return this.userService.createUser(userDto);
    }

    @Get()
    getAll(){
        return this.userService.getAllUsers();
    }

}
