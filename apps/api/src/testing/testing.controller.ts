import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TestingService } from './testing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AuthUser } from '@webhook-auto/types';

@UseGuards(JwtAuthGuard)
@Controller('testing')
export class TestingController {
  constructor(private testingService: TestingService) {}

  /**
   * POST /testing/send-test-event
   *
   * Sends a real test event through the full webhook pipeline for a specific bot.
   * The event is stored in the database, enqueued in BullMQ, and processed by
   * the worker. Results are visible in the Executions UI.
   *
   * Body: { botId: string, payload?: object }
   */
  @Post('send-test-event')
  async sendTestEvent(
    @CurrentUser() user: AuthUser,
    @Body() body: { botId: string; payload?: any },
  ) {
    const result = await this.testingService.testEvent(
      user.organizationId,
      body.botId,
      body.payload,
    );
    return { success: true, data: result };
  }
}
