import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatasourceUrl(): string | undefined {
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

  // If running on Vercel serverless environment and using SQLite file
  if (process.env.VERCEL && dbUrl.startsWith('file:')) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const sourceDbPath = path.resolve(process.cwd(), 'prisma/dev.db');
      if (fs.existsSync(sourceDbPath)) {
        try {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        } catch (err) {
          console.error('[DB Setup] Failed to copy dev.db to /tmp:', err);
        }
      }
    }
    return `file:${tmpDbPath}`;
  }

  return dbUrl;
}

const resolvedUrl = getDatasourceUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: resolvedUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
