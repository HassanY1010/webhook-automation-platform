import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BotsModule } from './bots/bots.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ExecutionsModule } from './executions/executions.module';
import { TestingModule } from './testing/testing.module';
import { AdminModule } from './admin/admin.module';
import { HealthController } from './health/health.controller';
import { RedisService } from './common/services/redis.service';

@Module({
  imports: [
    AuthModule,
    BotsModule,
    WebhooksModule,
    ExecutionsModule,
    TestingModule,
    AdminModule,
  ],
  controllers: [HealthController],
  // RedisService is provided globally so HealthController and other non-module
  // components can inject it without importing a separate module
  providers: [RedisService],
  exports: [RedisService],
})
export class AppModule {}
