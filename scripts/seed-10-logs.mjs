import fs from 'fs';
import path from 'path';

const sampleLogs = [
  {
    date: '2026-07-22',
    formattedDate: 'July 22, 2026',
    today: 'Finished Stripe interview prep & payment intent lifecycle integration.',
    learned: ['Stripe Webhook Signature Verification', 'PaymentIntent Idempotency Keys'],
    tomorrow: 'Build push notification service & VAPID keys setup',
  },
  {
    date: '2026-07-23',
    formattedDate: 'July 23, 2026',
    today: 'Configured Web Push VAPID keys and Service Worker push notification handlers.',
    learned: ['Web Push API (VAPID)', 'Service Worker Push Event Listeners', 'iOS 16.4+ PWA Push Notifications'],
    tomorrow: 'Build single-repo GitHub App OAuth flow',
  },
  {
    date: '2026-07-24',
    formattedDate: 'July 24, 2026',
    today: 'Implemented single-repo GitHub App authentication architecture.',
    learned: ['GitHub App Contents API', 'GraphQL Contribution Calendar Query', 'Scoped Repository Permissions'],
    tomorrow: 'Wire up PostgreSQL database persistence',
  },
  {
    date: '2026-07-25',
    formattedDate: 'July 25, 2026',
    today: 'Built Prisma PostgreSQL schema and database persistence layer.',
    learned: ['Prisma Client singleton pattern', 'User & DailyLog database relations'],
    tomorrow: 'Refactor UI to design.md specifications',
  },
  {
    date: '2026-07-26',
    formattedDate: 'July 26, 2026',
    today: 'Refactored UI to design.md specs with Utilitarian dark theme.',
    learned: ['IBM Plex Mono & Fraunces typography', 'Anti AI-Slop design guidelines', '6px corner radiuses'],
    tomorrow: 'Build The Track Grid signature component',
  },
  {
    date: '2026-07-27',
    formattedDate: 'July 27, 2026',
    today: 'Implemented The Track Grid signature component & dual-surface view.',
    learned: ['Multi-track color scales', 'Tier 1 Combined & Tier 2 Per-Track activity grids'],
    tomorrow: 'Build Onboarding Stepper Wizard',
  },
  {
    date: '2026-07-28',
    formattedDate: 'July 28, 2026',
    today: 'Built Onboarding Stepper Wizard for single-repo permissions.',
    learned: ['4-step onboarding flow', 'Private contributions verification check'],
    tomorrow: 'Add Australia timezone auto-detection',
  },
  {
    date: '2026-07-29',
    formattedDate: 'July 29, 2026',
    today: 'Added Australia timezone auto-detection and heatmap offset fixes.',
    learned: ['Browser Intl.DateTimeFormat timezone resolution', 'Local timezone ISO string date formatting'],
    tomorrow: 'Deploy to Cloud PostgreSQL DB & Vercel',
  },
  {
    date: '2026-07-30',
    formattedDate: 'July 30, 2026',
    today: 'Connected Cloud PostgreSQL DB (Neon) and completed Vercel production deployment.',
    learned: ['Vercel Serverless environment variables', 'Prisma auto-migrations on Vercel build'],
    tomorrow: 'Perform production verification & streak telemetry test',
  },
  {
    date: '2026-07-31',
    formattedDate: 'July 31, 2026',
    today: 'Completed Ember Commit production release and verification.',
    learned: ['Ember Commit branding', 'End-to-end Web Push & GitHub App integration'],
    tomorrow: 'Maintain daily 30-second journal streak',
  },
];

function seed() {
  console.log('--- Generating 10 Daily Log Markdown Files ---');

  const logsDir = path.resolve(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  for (const item of sampleLogs) {
    const markdownContent = `# ${item.formattedDate}

## Today

${item.today}

## Learned

${item.learned.map((l) => `- ${l}`).join('\n')}

## Tomorrow

- ${item.tomorrow}
`;

    const filePath = path.join(logsDir, `${item.date}.md`);
    fs.writeFileSync(filePath, markdownContent, 'utf8');
    console.log(`[FILE] Created ${filePath}`);
  }

  console.log('\n[SUCCESS] 10 daily log files generated in /logs directory!');
}

seed();
