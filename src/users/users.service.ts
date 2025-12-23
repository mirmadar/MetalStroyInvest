import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {

    constructor(private prisma: PrismaService, private roleService: RolesService) {}

    async createUser(userDto: CreateUserDto){

        await this.ensureEmailUnique(userDto.email);
        await this.ensureUsernameUnique(userDto.username);

        const role = await this.getRoleOrFail(userDto.role);
        const hashPassword = await bcrypt.hash(userDto.password, 5);

        const user = await this.prisma.user.create({
            data: {
                email: userDto.email,
                username: userDto.username,
                password: hashPassword,
                roles: {
                    connect: {
                        roleId: role.roleId,
                    },
                },
            },
            select: { 
                userId: true,
                email: true,
                username: true,
                roles: true,
            }
        });
        return user;
    }

    async getAllUsers(){
        const users = await this.prisma.user.findMany({
            select: { 
                userId: true,
                email: true,
                username: true,
                roles: true,
            }
        });
        return users;
    }

    
    async getUserById(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { userId },
            select: { 
                userId: true,
                email: true,
                username: true,
                roles: true,
            }
        });

        if (!user) return null;

        return user;
        }

    async getUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { 
                userId: true,
                email: true,
                username: true,
                password: true,
                roles: true,
            }
        });

        if (!user) return null;

        return user;
        }

async updatePassword(userId: number, passwordDto: UpdatePasswordDto) {
    
    const user = await this.getUserWithPasswordOrFail(userId);
    
    const isMatch = await bcrypt.compare(passwordDto.oldPassword, user.password);
    if (!isMatch) {
        throw new HttpException('Старый пароль неверный', HttpStatus.BAD_REQUEST);
    }

    // Проверяем, что новый пароль не совпадает со старым
    const isSame = await bcrypt.compare(passwordDto.newPassword, user.password);
    if (isSame) {
        throw new HttpException('Новый пароль должен отличаться от старого', HttpStatus.BAD_REQUEST);
    }
    
    const hashedPassword = await bcrypt.hash(passwordDto.newPassword, 5);
    await this.prisma.user.update({
        where: { userId },
        data: { password: hashedPassword },
    });
    
    return { message: 'Пароль успешно обновлен' };
}

  async updateUser(userId: number, updateDto: UpdateUserDto) {
    
    await this.getUserOrFail(userId);

    const updateData: {
        email?: string;
        username?: string;
        roles?: { set: { roleId: number }[] };
    } = {};

    if (updateDto.email) {
        await this.ensureEmailUnique(updateDto.email, userId);
        updateData.email = updateDto.email;
    }

    if (updateDto.username) {
        await this.ensureUsernameUnique(updateDto.username, userId);
        updateData.username = updateDto.username;
    }

    if (updateDto.role) {
        const role = await this.getRoleOrFail(updateDto.role);
        updateData.roles = { set: [{ roleId: role.roleId }] };
    }

    // Обновляем пользователя
    const updatedUser = await this.prisma.user.update({
            where: { userId },
            data: updateData,
            select: { 
                userId: true,
                email: true,
                username: true,
                roles: true,
            }
        });

    return updatedUser;
  }
  
  async deactivateUser(userId: number){
    await this.getUserOrFail(userId);

    await this.prisma.user.update({
        where: { userId },
        data: { isActive: false }
    });
    return { message: 'Пользователь диактивирован'};
  }

  async deleteUser(userId: number){
    await this.getUserOrFail(userId);

    await this.prisma.user.delete({
        where: { userId },
    });
    return { message: 'Пользователь удален'};
  }

private async getUserWithPasswordOrFail(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      password: true,
    },
  });

  if (!user) {
    throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
  }

  return user;
}

private async getUserOrFail(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { userId },
    select: {
      userId: true,
    },
  });

  if (!user) {
    throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
  }

  return user;
}


private async ensureEmailUnique(email: string, userId?: number) {
    const user = await this.prisma.user.findUnique({
        where: { email },
        select: { userId: true },
    });

    if (user && user.userId !== userId) {
        throw new HttpException('Email уже используется', HttpStatus.BAD_REQUEST);
    }
    }

private async ensureUsernameUnique(username: string, userId?: number) {
    const user = await this.prisma.user.findUnique({
        where: { username },
        select: { userId: true },
    });

    if (user && user.userId !== userId) {
        throw new HttpException('Username уже используется', HttpStatus.BAD_REQUEST);
    }
    }

private async getRoleOrFail(roleValue: string) {
    const role = await this.roleService.getRoleByValue(roleValue);

    if (!role) {
        throw new HttpException('Роль не найдена', HttpStatus.BAD_REQUEST);
    }

    return role;
    }

}