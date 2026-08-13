import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ExecutionsService } from './executions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AuthUser, RoleName } from '@webhook-auto/types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('executions')
export class ExecutionsController {
  constructor(private executionsService: ExecutionsService) {}

  @Roles(RoleName.VIEWER)
  @Get()
  async getExecutions(
    @CurrentUser() user: AuthUser,
    @Query('botId') botId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    const result = await this.executionsService.getExecutions(
      user.organizationId,
      botId,
      parseInt(page, 10),
      parseInt(limit, 10)
    );
    return { success: true, data: result.executions, meta: { totalCount: result.total, page: result.page, totalPages: result.totalPages } };
  }

  @Roles(RoleName.VIEWER)
  @Get('dlq')
  async getDeadLetterQueue(@CurrentUser() user: AuthUser) {
    const result = await this.executionsService.getDeadLetterQueue(user.organizationId);
    return { success: true, data: result };
  }

  @Roles(RoleName.VIEWER)
  @Get(':id')
  async getExecutionById(@CurrentUser() user: AuthUser, @Param('id') executionId: string) {
    const result = await this.executionsService.getExecutionById(user.organizationId, executionId);
    return { success: true, data: result };
  }

  @Roles(RoleName.OPERATOR, RoleName.EDITOR, RoleName.ADMIN, RoleName.OWNER)
  @Post(':id/retry')
  async retryExecution(@CurrentUser() user: AuthUser, @Param('id') executionId: string) {
    const result = await this.executionsService.retryExecution(user.organizationId, executionId);
    return { success: true, data: result };
  }
}
