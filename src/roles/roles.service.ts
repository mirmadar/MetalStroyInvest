import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {

    constructor(private prisma: PrismaService) {}

    async createRole(roleDto: CreateRoleDto){
        
        const existingRole = await this.prisma.role.findUnique({
            where: { value: roleDto.value },
        });

        if(existingRole) {
            throw new HttpException(`Роль "{roleDto.value}" уже существует`, HttpStatus.BAD_REQUEST);
        }
        
        const role = await this.prisma.role.create({
            data: {
                value: roleDto.value,
                description: roleDto.description,
            }
        });
        return role;
    }

    async getRoleByValue(value: string){
        
        const role = await this.prisma.role.findUnique({
            where: {
                value: value,
            }
        });

        if(!role) {
            throw new HttpException( `Роль "${value}" не найдена`, HttpStatus.NOT_FOUND);
        }
        return role;
    }

    async getAllRoles(){
        const roles = await this.prisma.role.findMany({
            select: {
                value: true,
                description: true,
            }
        })
        return roles;
    }
}
