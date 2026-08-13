import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '@webhook-auto/types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.OWNER)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  async getSystemStats() {
    const stats = await this.adminService.getSystemStats();
    return { success: true, data: stats };
  }

  @Get('feature-flags')
  async getFeatureFlags() {
    const flags = await this.adminService.getFeatureFlags();
    return { success: true, data: flags };
  }

  @Post('feature-flags/:key/toggle')
  async toggleFeatureFlag(@Param('key') key: string, @Body('isEnabled') isEnabled: boolean) {
    const flag = await this.adminService.toggleFeatureFlag(key, isEnabled);
    return { success: true, data: flag };
  }
}
