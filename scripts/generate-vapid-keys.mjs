import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

const vapidKeys = webpush.generateVAPIDKeys();

console.log('--- Generated VAPID Keys ---');
console.log('Public Key:\n', vapidKeys.publicKey);
console.log('\nPrivate Key:\n', vapidKeys.privateKey);

const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

if (!envContent.includes('NEXT_PUBLIC_VAPID_PUBLIC_KEY')) {
  const newEnv = `\nNEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"\nVAPID_PRIVATE_KEY="${vapidKeys.privateKey}"\nVAPID_SUBJECT="mailto:support@githubstreak.local"\n`;
  fs.appendFileSync(envPath, newEnv);
  console.log('\n[SUCCESS] VAPID keys added to .env file!');
} else {
  console.log('\n[INFO] VAPID keys already exist in .env file.');
}
