import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { RedisService } from '../common/services/redis.service';

@Module({
  controllers: [WebhooksController],
  providers: [WebhooksService, RedisService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
