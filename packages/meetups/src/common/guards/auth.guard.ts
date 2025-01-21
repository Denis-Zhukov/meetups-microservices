import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RMQ_AUTH } from '@/app.constants';
import { Request, Response } from 'express';
import {
  EXCEPTION_MESSAGES,
  RMQ_GET_ACCESS_TOKEN_DATA,
} from './guards.constants';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(RMQ_AUTH) private readonly client: ClientProxy,
    private readonly logger: LoggerService
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(EXCEPTION_MESSAGES.tokenMissing);
    }

    let response: Response;
    try {
      response = await lastValueFrom(
        this.client.send(RMQ_GET_ACCESS_TOKEN_DATA, { token })
      );
    } catch (error) {
      this.logger.error(EXCEPTION_MESSAGES.errorGetPayload, error);
      throw new UnauthorizedException(EXCEPTION_MESSAGES.unavailable);
    }

    if (!response) {
      throw new UnauthorizedException(EXCEPTION_MESSAGES.invalidToken);
    }

    request.user = response;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) return null;

    const [type, token] = authorizationHeader.split(' ');

    return type === 'Bearer' && token ? token : null;
  }
}
