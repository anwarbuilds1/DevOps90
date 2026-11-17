import { NextResponse } from 'next/server';
import { initDbSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  const result = await initDbSchema();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
