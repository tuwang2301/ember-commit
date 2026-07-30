import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth/session';
import { getAppUrl } from '@/lib/auth/config';

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  await clearSession();
  return NextResponse.redirect(getAppUrl());
}
