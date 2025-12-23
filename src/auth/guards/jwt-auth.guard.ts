import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtPayload } from '../types/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    try {
      const user = this.jwtService.verify<JwtPayload>(token);
      req.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Пользователь не авторизован');
    }
  }
}
