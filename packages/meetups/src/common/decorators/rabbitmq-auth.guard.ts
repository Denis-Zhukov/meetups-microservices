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
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(RMQ_AUTH) private readonly client: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token)
      throw new UnauthorizedException('Authorization token is missing');

    let response;
    try {
      response = await lastValueFrom(
        this.client.send('get_access_token_data', { token })
      );
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Authorization service is unavailable');
    }

    if (!response) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = response;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      return null;
    }

    const [type, token] = authorizationHeader.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}
