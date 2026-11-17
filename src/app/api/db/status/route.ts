import { NextResponse } from 'next/server';
import { isDatabaseConfigured, testDbConnection } from '@/lib/db';
import {
  isSupabaseApiClientConfigured,
  testSupabaseClientConnection,
} from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasDbUrl = isDatabaseConfigured();
  const hasSupabaseClient = isSupabaseApiClientConfigured;

  if (hasDbUrl) {
    const testResult = await testDbConnection();
    return NextResponse.json({
      configured: true,
      connected: testResult.success,
      mode: testResult.success ? 'supabase_postgres' : 'connection_error',
      message: testResult.message,
      timestamp: testResult.timestamp,
    });
  }

  if (hasSupabaseClient) {
    const testResult = await testSupabaseClientConnection();
    return NextResponse.json({
      configured: true,
      connected: testResult.connected,
      tableMissing: testResult.tableMissing,
      mode: testResult.connected ? 'supabase_api' : 'supabase_pending_table',
      message: testResult.message,
    });
  }

  return NextResponse.json({
    configured: false,
    connected: false,
    mode: 'unconfigured',
    message: 'Supabase credentials not configured in environment variables.',
  });
}
