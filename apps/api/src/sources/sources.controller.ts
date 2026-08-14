import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SourcesService } from './sources.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AuthUser, RoleName } from '@webhook-auto/types';
import { CreateSourceSchema, UpdateSourceSchema } from '@webhook-auto/validation';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sources')
export class SourcesController {
  constructor(private sourcesService: SourcesService) {}

  @Roles(RoleName.VIEWER)
  @Get()
  async getSources(
    @CurrentUser() user: AuthUser,
    @Query('botId') botId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const result = await this.sourcesService.getSources(
      user.organizationId,
      botId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
    return {
      success: true,
      data: result.sources,
      meta: {
        totalCount: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    };
  }

  @Roles(RoleName.VIEWER)
  @Get(':id')
  async getSourceById(
    @CurrentUser() user: AuthUser,
    @Param('id') sourceId: string,
  ) {
    const source = await this.sourcesService.getSourceById(
      user.organizationId,
      sourceId,
    );
    return { success: true, data: source };
  }

  @Roles(RoleName.OPERATOR, RoleName.EDITOR, RoleName.ADMIN, RoleName.OWNER)
  @Post()
  async createSource(@CurrentUser() user: AuthUser, @Body() body: any) {
    try {
      const validated = CreateSourceSchema.parse(body);
      const result = await this.sourcesService.createSource(
        user.organizationId,
        validated as any,
      );
      return { success: true, data: result };
    } catch (err: any) {
      if (err?.name === 'ZodError') {
        const firstIssue = err.issues?.[0]?.message || 'Invalid source input';
        throw new BadRequestException(firstIssue);
      }
      throw err;
    }
  }

  @Roles(RoleName.EDITOR, RoleName.ADMIN, RoleName.OWNER)
  @Patch(':id')
  async updateSource(
    @CurrentUser() user: AuthUser,
    @Param('id') sourceId: string,
    @Body() body: any,
  ) {
    try {
      const validated = UpdateSourceSchema.parse(body);
      const result = await this.sourcesService.updateSource(
        user.organizationId,
        sourceId,
        validated as any,
      );
      return { success: true, data: result };
    } catch (err: any) {
      if (err?.name === 'ZodError') {
        const firstIssue = err.issues?.[0]?.message || 'Invalid update input';
        throw new BadRequestException(firstIssue);
      }
      throw err;
    }
  }

  @Roles(RoleName.OPERATOR, RoleName.EDITOR, RoleName.ADMIN, RoleName.OWNER)
  @Post(':id/toggle')
  async toggleSource(
    @CurrentUser() user: AuthUser,
    @Param('id') sourceId: string,
  ) {
    const result = await this.sourcesService.toggleSourceStatus(
      user.organizationId,
      sourceId,
    );
    return { success: true, data: result };
  }

  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @Post(':id/rotate-secret')
  async rotateSecret(
    @CurrentUser() user: AuthUser,
    @Param('id') sourceId: string,
  ) {
    const result = await this.sourcesService.rotateSourceSecret(
      user.organizationId,
      sourceId,
    );
    return { success: true, data: result };
  }

  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @Delete(':id')
  async deleteSource(
    @CurrentUser() user: AuthUser,
    @Param('id') sourceId: string,
  ) {
    const result = await this.sourcesService.deleteSource(
      user.organizationId,
      sourceId,
    );
    return { success: true, data: result };
  }
}
