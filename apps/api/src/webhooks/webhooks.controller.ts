import { Controller, Post, Body, Param, Headers, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Request } from 'express';

@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post(':publicKey')
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestWebhook(
    @Param('publicKey') publicKey: string,
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
    @Req() req: Request
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    return this.webhooksService.handleIncomingWebhook(publicKey, payload, headers, ipAddress);
  }
}
