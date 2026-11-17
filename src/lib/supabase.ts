import { createClient } from '@supabase/supabase-js';
import { TrackerState } from '@/types/tracker';

// Polyfill WebSocket for Node runtime where realtime is not used
if (typeof globalThis !== 'undefined' && !globalThis.WebSocket) {
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = class DummyWebSocket {};
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseApiClientConfigured = Boolean(
  supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://')
);

// We disable realtime websocket auto-connect if on server/Node to avoid runtime WebSocket requirements
export const supabase = isSupabaseApiClientConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null;

export async function testSupabaseClientConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  tableMissing?: boolean;
  message: string;
}> {
  if (!supabase) {
    return {
      configured: false,
      connected: false,
      message: 'Supabase URL or Publishable key is missing in .env.local.',
    };
  }

  try {
    const { error } = await supabase
      .from('devops_tracker')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST205') {
        return {
          configured: true,
          connected: false,
          tableMissing: true,
          message:
            'Connected to Supabase! Table "devops_tracker" does not exist yet. Run supabase-schema.sql in your Supabase SQL Editor.',
        };
      }
      return {
        configured: true,
        connected: false,
        message: `Supabase error: ${error.message}`,
      };
    }

    return {
      configured: true,
      connected: true,
      message: 'Connected to Supabase and verified "devops_tracker" table access.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      configured: true,
      connected: false,
      message: `Failed to contact Supabase: ${msg}`,
    };
  }
}

export async function getTrackerFromSupabase(
  userId: string = 'default'
): Promise<TrackerState | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('devops_tracker')
      .select('data')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data.data as TrackerState;
  } catch (err) {
    console.error('Error fetching tracker from Supabase:', err);
    return null;
  }
}

export async function saveTrackerToSupabase(
  data: TrackerState,
  userId: string = 'default'
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('devops_tracker').upsert({
      id: userId,
      data,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error upserting to Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error saving to Supabase:', err);
    return false;
  }
}
