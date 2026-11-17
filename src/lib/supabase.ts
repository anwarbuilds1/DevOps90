import { createClient } from '@supabase/supabase-js';
import { TrackerState } from '@/types/tracker';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY } from '@/utils/supabase/client';

export const getSupabaseUrl = (): string =>
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;

export const getSupabaseKey = (): string =>
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_KEY;

export const isSupabaseApiClientConfigured = true;

// Custom node https fetch adapter to prevent undici connect timeouts in Node runtimes
function nodeHttpsFetch(url: string | URL | Request, options?: RequestInit): Promise<Response> {
  // If in browser, use native window.fetch
  if (typeof window !== 'undefined') {
    return fetch(url, options);
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const https = require('https');
  const urlString = typeof url === 'string' ? url : url.toString();
  const parsedUrl = new URL(urlString);

  const headers: Record<string, string> = {};
  if (options?.headers) {
    if (typeof (options.headers as Headers).forEach === 'function') {
      (options.headers as Headers).forEach((val: string, key: string) => {
        headers[key] = val;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([k, v]) => {
        headers[k] = v;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: options?.method || 'GET',
        headers,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        timeout: 10000,
      },
      (res: import('http').IncomingMessage) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const bodyText = Buffer.concat(chunks).toString('utf8');
          resolve({
            ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 300,
            status: res.statusCode || 200,
            statusText: res.statusMessage || 'OK',
            headers: new Headers(res.headers as Record<string, string>),
            text: async () => bodyText,
            json: async () => JSON.parse(bodyText),
          } as unknown as Response);
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('HTTPS connection timeout'));
    });

    if (options?.body) {
      req.write(
        typeof options.body === 'string'
          ? options.body
          : JSON.stringify(options.body)
      );
    }
    req.end();
  });
}

// Polyfill WebSocket for Node runtime where realtime is not used
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const WebSocketImpl = require('ws');
    if (!globalThis.WebSocket) {
      (globalThis as unknown as { WebSocket: unknown }).WebSocket = WebSocketImpl;
    }
  } catch {
    if (!globalThis.WebSocket) {
      (globalThis as unknown as { WebSocket: unknown }).WebSocket = class DummyWebSocket {};
    }
  }
}

// Supabase client instance for server-side operations
export const supabase = createClient(getSupabaseUrl(), getSupabaseKey(), {
  auth: { persistSession: false },
  global: { fetch: nodeHttpsFetch },
});

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
      message: 'Supabase URL or Publishable key is missing.',
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
