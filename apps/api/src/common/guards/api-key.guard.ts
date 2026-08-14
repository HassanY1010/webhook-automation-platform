import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeysService } from '../../api-keys/api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || request.headers['x-api-key'];

    if (!authHeader) {
      throw new UnauthorizedException('API Key missing in request headers');
    }

    let rawKey = authHeader;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      rawKey = authHeader.substring(7);
    }

    const user = await this.apiKeysService.validateApiKey(rawKey);
    request.user = user;
    return true;
  }
}
