import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { StreamChat } from 'npm:stream-chat@9.18.0';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

const streamTokenValidityInSeconds = 60 * 60;

function jsonResponse(status: number, data: unknown, error: string | null) {
  return new Response(JSON.stringify({ data, error }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    status,
  });
}

function requireEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}.`);
  }

  return value;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, null, 'Method not allowed.');
  }

  try {
    const authorization = request.headers.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return jsonResponse(401, null, 'Missing Supabase bearer token.');
    }

    const supabaseUrl = requireEnv('SUPABASE_URL');
    const supabaseAnonKey =
      Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');

    if (!supabaseAnonKey) {
      throw new Error(
        'Missing required environment variable: SUPABASE_ANON_KEY or SUPABASE_PUBLISHABLE_KEY.'
      );
    }

    const streamApiKey = requireEnv('STREAM_API_KEY');
    const streamApiSecret = requireEnv('STREAM_API_SECRET');

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse(401, null, 'Invalid or expired Supabase session.');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, is_onboarded')
      .eq('id', user.id)
      .maybeSingle<{
        avatar_url: string | null;
        full_name: string;
        id: string;
        is_onboarded: boolean;
      }>();

    if (profileError) {
      throw profileError;
    }

    if (!profile?.is_onboarded) {
      return jsonResponse(403, null, 'Complete onboarding before requesting a Stream token.');
    }

    const serverClient = StreamChat.getInstance(streamApiKey, streamApiSecret);
    const expiresAt = new Date(Date.now() + streamTokenValidityInSeconds * 1000);
    const token = serverClient.createToken(user.id, Math.floor(expiresAt.getTime() / 1000));

    return jsonResponse(
      200,
      {
        expires_at: expiresAt.toISOString(),
        token,
        user_id: profile.id,
      },
      null
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error while minting a Stream token.';
    return jsonResponse(500, null, message);
  }
});
