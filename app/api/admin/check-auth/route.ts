import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth();

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}
