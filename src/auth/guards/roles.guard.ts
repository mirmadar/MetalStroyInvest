import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../../auth/types/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();

    const user = req.user;

    if (!user || !user.roles) {
      throw new ForbiddenException('Нет данных о пользователе');
    }

    const hasRole = user.roles.some((role) => requiredRoles.includes(role.value));

    if (!hasRole) {
      throw new ForbiddenException('Нет прав для доступа к этому ресурсу');
    }

    return true;
  }
}
