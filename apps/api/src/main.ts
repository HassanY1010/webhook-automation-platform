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
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

import { execSync } from 'child_process';

async function bootstrap() {
  // Auto-migrate and seed production PostgreSQL database schema at runtime startup
  try {
    const candidatePaths = [
      path.resolve(process.cwd(), 'packages/database/prisma/schema.prisma'),
      path.resolve(__dirname, '../../packages/database/prisma/schema.prisma'),
      path.resolve(__dirname, '../../../packages/database/prisma/schema.prisma'),
      path.resolve(__dirname, '../packages/database/prisma/schema.prisma'),
    ];
    const targetSchema = candidatePaths.find((p) => fs.existsSync(p));

    if (targetSchema && process.env.DATABASE_URL) {
      console.log(`📦 Found schema at ${targetSchema}. Auto-migrating PostgreSQL database...`);
      execSync(`npx prisma db push --schema="${targetSchema}" --accept-data-loss`, { stdio: 'inherit' });
      console.log('✅ PostgreSQL database schema migrated successfully!');

      // Run database seed to guarantee default admin account exists
      const seedPaths = [
        path.resolve(process.cwd(), 'packages/database/prisma/seed.js'),
        path.resolve(path.dirname(targetSchema), 'seed.js'),
      ];
      const targetSeed = seedPaths.find((p) => fs.existsSync(p));
      if (targetSeed) {
        console.log(`🌱 Executing database seed from ${targetSeed}...`);
        execSync(`node "${targetSeed}"`, { stdio: 'inherit' });
        console.log('✅ Database seeded successfully!');
      }
    }
  } catch (migErr: any) {
    console.warn('Database startup migration status:', migErr.message);
  }

  const app = await NestFactory.create(AppModule);

  // Unconditional Preflight & CORS Header Handler
  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin || 'https://webhook-auto-web.onrender.com';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID, X-Webhook-Signature, X-Webhook-Timestamp, X-Idempotency-Key'
    );

    if (req.method === 'OPTIONS') {
      return res.status(200).send('OK');
    }
    next();
  });

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
