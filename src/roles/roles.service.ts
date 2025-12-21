import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {

    constructor(private prisma: PrismaService) {}

    async createRole(dto: CreateRoleDto){
        const role = await this.prisma.role.create({
            data: {
                value: dto.value,
                description: dto.description,
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
        return role;
    }
}
