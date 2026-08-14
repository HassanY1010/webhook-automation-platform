import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AuthUser, RoleName } from '@webhook-auto/types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  /** Platform-wide stats — OWNER only */
  @Roles(RoleName.OWNER)
  @Get('stats')
  async getSystemStats() {
    const stats = await this.adminService.getSystemStats();
    return { success: true, data: stats };
  }

  /**
   * Organization-scoped dashboard stats — any authenticated member.
   * Returns real execution metrics for the caller's organization.
   * Used by the Dashboard overview page.
   */
  @Roles(RoleName.VIEWER)
  @Get('org-stats')
  async getOrgStats(@CurrentUser() user: AuthUser) {
    const stats = await this.adminService.getOrgStats(user.organizationId);
    return { success: true, data: stats };
  }

  @Roles(RoleName.OWNER)
  @Get('feature-flags')
  async getFeatureFlags() {
    const flags = await this.adminService.getFeatureFlags();
    return { success: true, data: flags };
  }

  @Roles(RoleName.OWNER)
  @Post('feature-flags/:key/toggle')
  async toggleFeatureFlag(
    @Param('key') key: string,
    @Body('isEnabled') isEnabled: boolean,
  ) {
    const flag = await this.adminService.toggleFeatureFlag(key, isEnabled);
    return { success: true, data: flag };
  }
}
