import { NextResponse } from 'next/server';
import { isDatabaseConfigured, testDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configured = isDatabaseConfigured();
  if (!configured) {
    return NextResponse.json({
      configured: false,
      connected: false,
      mode: 'local_storage',
      message: 'No DATABASE_URL configured in environment variables. Operating in local storage mode.',
    });
  }

  const testResult = await testDbConnection();

  return NextResponse.json({
    configured: true,
    connected: testResult.success,
    mode: testResult.success ? 'supabase_postgres' : 'connection_error',
    message: testResult.message,
    timestamp: testResult.timestamp,
  });
}
