import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AuthUser, RoleName } from '@webhook-auto/types';
import { CreateApiKeySchema } from '@webhook-auto/validation';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Roles(RoleName.VIEWER, RoleName.OPERATOR, RoleName.EDITOR, RoleName.ADMIN, RoleName.OWNER)
  @Get()
  async getApiKeys(@CurrentUser() user: AuthUser) {
    const keys = await this.apiKeysService.getApiKeys(user.organizationId);
    return { success: true, data: keys };
  }

  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @Post()
  async createApiKey(@CurrentUser() user: AuthUser, @Body() body: any) {
    try {
      const validated = CreateApiKeySchema.parse(body);
      const result = await this.apiKeysService.createApiKey(
        user.organizationId,
        user.id,
        validated as any,
      );
      return { success: true, data: result };
    } catch (err: any) {
      if (err?.name === 'ZodError') {
        const firstIssue = err.issues?.[0]?.message || 'Invalid API key input';
        throw new BadRequestException(firstIssue);
      }
      throw err;
    }
  }

  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @Post(':id/revoke')
  async revokeApiKey(
    @CurrentUser() user: AuthUser,
    @Param('id') keyId: string,
  ) {
    const result = await this.apiKeysService.revokeApiKey(
      user.organizationId,
      keyId,
    );
    return { success: true, data: result };
  }

  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @Delete(':id')
  async deleteApiKey(
    @CurrentUser() user: AuthUser,
    @Param('id') keyId: string,
  ) {
    const result = await this.apiKeysService.deleteApiKey(
      user.organizationId,
      keyId,
    );
    return { success: true, data: result };
  }
}
