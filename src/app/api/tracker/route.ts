import { NextResponse } from 'next/server';
import { isDatabaseConfigured, getTrackerDataFromDb, saveTrackerDataToDb } from '@/lib/db';
import {
  isSupabaseApiClientConfigured,
  getTrackerFromSupabase,
  saveTrackerToSupabase,
} from '@/lib/supabase';
import { TrackerState } from '@/types/tracker';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Method 1: Postgres Direct URL
  if (isDatabaseConfigured()) {
    try {
      const data = await getTrackerDataFromDb();
      return NextResponse.json({
        configured: true,
        data,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ configured: true, error: msg }, { status: 500 });
    }
  }

  // Method 2: Supabase Client SDK
  if (isSupabaseApiClientConfigured) {
    try {
      const data = await getTrackerFromSupabase();
      return NextResponse.json({
        configured: true,
        data,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ configured: true, error: msg }, { status: 500 });
    }
  }

  // Fallback: Local Client mode
  return NextResponse.json({
    configured: false,
    data: null,
    message: 'Database not configured in environment. Using local client state.',
  });
}

export async function POST(request: Request) {
  let body: { data?: TrackerState } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const data = body.data;
  if (!data || typeof data !== 'object') {
    return NextResponse.json(
      { success: false, error: 'Invalid tracker payload' },
      { status: 400 }
    );
  }

  data.ts = Date.now();

  // Method 1: Postgres Direct
  if (isDatabaseConfigured()) {
    const ok = await saveTrackerDataToDb(data);
    return NextResponse.json({
      configured: true,
      success: ok,
      timestamp: data.ts,
    });
  }

  // Method 2: Supabase Client SDK
  if (isSupabaseApiClientConfigured) {
    const ok = await saveTrackerToSupabase(data);
    return NextResponse.json({
      configured: true,
      success: ok,
      timestamp: data.ts,
    });
  }

  return NextResponse.json({
    configured: false,
    success: false,
    message: 'Database not configured. Saved in browser local storage only.',
  });
}
