import { NextResponse } from 'next/server';
import {
  getAuthenticatedUser,
  sanitizeUser,
  unauthorizedResponse,
} from '@/lib/auth/get-user';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  return NextResponse.json({
    authenticated: true,
    needsInstall: !user.githubInstallationId,
    user: sanitizeUser(user),
  });
}
