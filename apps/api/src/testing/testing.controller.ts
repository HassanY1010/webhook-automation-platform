import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TestingService } from './testing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('testing')
export class TestingController {
  constructor(private testingService: TestingService) {}

  @Post('send-test-event')
  async sendTestEvent(@Body() body: { payload: any; rules: any; actions: any[] }) {
    const result = await this.testingService.testEvent(body.payload, body.rules, body.actions);
    return { success: true, data: result };
  }
}
