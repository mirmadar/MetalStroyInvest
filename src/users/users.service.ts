import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class UsersService {

    constructor(private prisma: PrismaService, private roleService: RolesService) {}

    async createUser(dto: CreateUserDto){
        
        const role = await this.roleService.getRoleByValue("ADMIN")

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                username: dto.username,
                password: dto.password,
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
