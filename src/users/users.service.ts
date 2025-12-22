import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {

    constructor(private prisma: PrismaService, private roleService: RolesService) {}

    async createUser(userDto: CreateUserDto){

        const candidate = await this.findUserByEmailOrUsername(userDto.email, userDto.username)
        if(candidate){
            throw new HttpException('Пользователь с таким именем или email уже существует', HttpStatus.BAD_REQUEST)
        }
        const hashPassword = await bcrypt.hash(userDto.password, 5);
        
        const role = await this.roleService.getRoleByValue("ADMIN")

        const user = await this.prisma.user.create({
            data: {
                email: userDto.email,
                username: userDto.username,
                password: hashPassword,
                roles: {
                    connect: {
                        roleId: role?.roleId,
                    },
                },
            },
            include: {
                roles: true, 
            }
        });
        return user;
    }

    async getAllUsers(){
        const users = await this.prisma.user.findMany({
            include:{
                roles:true,
            }
        });
        return users;
    }

    async findUserByEmailOrUsername(email: string, username: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                ],
            },
        });
        return user;
    }

        async getUserByEmail(email: string){
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
            include:{
                roles:true,
            }
        });
        return user;
    }
}
