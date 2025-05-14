import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { User } from 'src/users/models/user.schema';

interface AdminRequest extends Request {
  user: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AdminRequest = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw new HttpException(
        'Authorization token missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const valid = await this.auth.checkAuth(token)
      request.user = valid as User;
      //TODO add groups
      return true;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AdminRequest = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw new HttpException(
        'Authorization token missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const valid = await this.auth.checkAuth(token)
      if (valid && valid?.role == 'admin') {
        request.user = valid as User;
        //TODO add groups
        return true;
      }
      else throw new HttpException(
        'Not authorized',
        HttpStatus.UNAUTHORIZED,
      );

    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
}