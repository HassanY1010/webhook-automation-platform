import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Auto-load root .env file if process.env.DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  const rootEnvPath = path.resolve(__dirname, '../../.env');
  const rootParentEnvPath = path.resolve(__dirname, '../../../.env');
  const localEnvPath = path.resolve(__dirname, './.env');
  
  const targetEnv = fs.existsSync(rootEnvPath)
    ? rootEnvPath
    : fs.existsSync(rootParentEnvPath)
    ? rootParentEnvPath
    : fs.existsSync(localEnvPath)
    ? localEnvPath
    : null;

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
}

let dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  // If sslmode is not already configured
  if (!dbUrl.includes('sslmode=') && !dbUrl.includes('ssl=')) {
    // Only external Render database URLs (ending in .render.com) or cloud DB providers require SSL
    // Internal Render database URLs (e.g. host is dpg-xxx-a without .render.com) connect via private network and do not use TLS
    if (
      dbUrl.includes('.render.com') ||
      dbUrl.includes('neon.tech') ||
      dbUrl.includes('supabase.co') ||
      dbUrl.includes('pooler.supabase.com')
    ) {
      dbUrl = dbUrl.includes('?') ? `${dbUrl}&sslmode=no-verify` : `${dbUrl}?sslmode=no-verify`;
    }
  }
}

export * from './src/init-db';
export * from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
