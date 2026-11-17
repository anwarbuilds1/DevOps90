import { NextResponse } from 'next/server';
import { isDatabaseConfigured, getTrackerDataFromDb, saveTrackerDataToDb } from '@/lib/db';
import { TrackerState } from '@/types/tracker';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      data: null,
      message: 'Database not configured in environment. Using local client state.',
    });
  }

  try {
    const data = await getTrackerDataFromDb();
    return NextResponse.json({
      configured: true,
      data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { configured: true, error: msg },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      success: false,
      message: 'Database not configured. Saved in browser local storage only.',
    });
  }

  try {
    const body = await request.json();
    const data = body.data as TrackerState;

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid tracker payload' },
        { status: 400 }
      );
    }

    // Ensure timestamp is recorded
    data.ts = Date.now();

    const ok = await saveTrackerDataToDb(data);

    if (ok) {
      return NextResponse.json({
        configured: true,
        success: true,
        timestamp: data.ts,
      });
    } else {
      return NextResponse.json(
        { configured: true, success: false, error: 'Failed to write to database' },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { configured: true, success: false, error: msg },
      { status: 500 }
    );
  }
}
