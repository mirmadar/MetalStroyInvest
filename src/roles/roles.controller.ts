import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
    constructor(private roleService: RolesService){}

    @Post()
    @Roles('SUPER_ADMIN')
    async create(@Body() roleDto: CreateRoleDto){
        return this.roleService.createRole(roleDto);
    }

    @Get()
    @Roles('SUPER_ADMIN')
    async getAll() {
        return this.roleService.getAllRoles();
    }

    @Get('/:value')
    @Roles('SUPER_ADMIN')
    async getByValue(@Param('value') value: string) {
        return this.roleService.getRoleByValue(value);
    }
}
