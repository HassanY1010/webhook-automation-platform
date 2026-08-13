import * as fs from 'fs';
import * as path from 'path';

// Native env loader without external package dependencies
const rootEnvPath = path.resolve(__dirname, '../../.env');
const parentEnvPath = path.resolve(__dirname, '../../../.env');
const targetEnv = fs.existsSync(rootEnvPath) ? rootEnvPath : fs.existsSync(parentEnvPath) ? parentEnvPath : null;

if (targetEnv) {
  const envContent = fs.readFileSync(targetEnv, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      if (!process.env[key]) process.env[key] = val.trim();
    }
  });
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Official Standard CORS Middleware
  app.use(
    cors({
      origin: ['https://webhook-auto-web.onrender.com', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Webhook-Signature', 'X-Webhook-Timestamp', 'X-Idempotency-Key', 'Accept'],
    })
  );

  // Global Interceptors & Pipes
  app.useGlobalInterceptors(new RequestIdInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    })
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Webhook Automation Platform API')
    .setDescription('Production-Ready Multi-Tenant Webhook & API Automation SaaS API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API Server running on port ${port} bound to 0.0.0.0`);
}

bootstrap();
