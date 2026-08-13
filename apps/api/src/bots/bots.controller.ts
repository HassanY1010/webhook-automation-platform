import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BotsService } from './bots.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AuthUser, RoleName } from '@webhook-auto/types';
import { CreateBotSchema, UpdateBotSchema } from '@webhook-auto/validation';
import { BotStatus } from '@webhook-auto/database';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bots')
export class BotsController {
  constructor(private botsService: BotsService) {}

  @Roles(RoleName.EDITOR, RoleName.ADMIN, RoleName.OWNER)
  @Post()
  async createBot(@CurrentUser() user: AuthUser, @Body() body: any) {
    const validated = CreateBotSchema.parse(body);
    const result = await this.botsService.createBot(user.organizationId, validated);
    return { success: true, data: result };
  }

  @Roles(RoleName.VIEWER)
  @Get()
  async getBots(
    @CurrentUser() user: AuthUser,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    const result = await this.botsService.getBots(user.organizationId, parseInt(page, 10), parseInt(limit, 10));
    return { success: true, data: result.bots, meta: { totalCount: result.total, page: result.page, totalPages: result.totalPages } };
  }

  @Roles(RoleName.VIEWER)
  @Get(':id')
  async getBotById(@CurrentUser() user: AuthUser, @Param('id') botId: string) {
    const result = await this.botsService.getBotById(user.organizationId, botId);
    return { success: true, data: result };
  }

  @Roles(RoleName.EDITOR, RoleName.ADMIN, RoleName.OWNER)
  @Put(':id')
  async updateBot(@CurrentUser() user: AuthUser, @Param('id') botId: string, @Body() body: any) {
    const validated = UpdateBotSchema.parse(body);
    const result = await this.botsService.updateBot(user.organizationId, botId, validated);
    return { success: true, data: result };
  }

  @Roles(RoleName.OPERATOR, RoleName.EDITOR, RoleName.ADMIN, RoleName.OWNER)
  @Post(':id/toggle')
  async toggleBot(@CurrentUser() user: AuthUser, @Param('id') botId: string, @Body('status') status: BotStatus) {
    const result = await this.botsService.toggleBotStatus(user.organizationId, botId, status);
    return { success: true, data: result };
  }

  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @Post(':id/rollback/:version')
  async rollbackVersion(@CurrentUser() user: AuthUser, @Param('id') botId: string, @Param('version') version: string) {
    const result = await this.botsService.rollbackVersion(user.organizationId, botId, parseInt(version, 10));
    return { success: true, data: result };
  }

  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @Delete(':id')
  async deleteBot(@CurrentUser() user: AuthUser, @Param('id') botId: string) {
    const result = await this.botsService.deleteBot(user.organizationId, botId);
    return { success: true, data: result };
  }
}
