import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Controller, Post, Body, Get, UseGuards, Param, Patch, Delete } from '@nestjs/common';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private userService: UsersService) {}

  //CREATE
  @Post()
  @Roles('SUPER_ADMIN')
  async create(@Body() userDto: CreateUserDto) {
    return this.userService.createUser(userDto);
  }

  //READ
  @Get()
  @Roles('SUPER_ADMIN')
  async getAll() {
    return this.userService.getAllUsers();
  }

  @Get('me')
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.getUserById(user.userId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  async getUserById(@Param('id') id: string) {
    const userId = parseInt(id);
    const user = await this.userService.getUserById(userId);

    return user;
  }

  //UPDATE
  @Patch(':id')
  @Roles('SUPER_ADMIN')
  async updateUser(@Param('id') id: string, @Body() userDto: UpdateUserDto) {
    const userId = parseInt(id);
    const updatedUser = await this.userService.updateUser(userId, userDto);
    return updatedUser;
  }

  @Patch('me/password')
  async changePassword(@CurrentUser() user: JwtPayload, @Body() passwordDto: UpdatePasswordDto) {
    return this.userService.updatePassword(user.userId, passwordDto);
  }

  //DELETE
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  async deleteUser(@Param('id') id: string) {
    const userId = parseInt(id);
    return this.userService.deleteUser(userId);
  }
}
