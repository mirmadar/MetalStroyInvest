import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as { id: number; roles: { value: string }[] };

    if (!user || !user.roles) {
      throw new ForbiddenException('Нет данных о пользователе');
    }

    const hasRole = user.roles.some(r => requiredRoles.includes(r.value));

    if (!hasRole) {
      throw new ForbiddenException('Нет прав для доступа к этому ресурсу');
    }

    return true;
  }
}
