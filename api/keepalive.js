const { supabase } = require('./_shared/supabase');

/**
 * Keeps the Supabase project from being paused for inactivity.
 *
 * The previous keep-alive listed a storage bucket. That is the Storage API --
 * the free-plan pause watches *database* activity, so the ping returned 200
 * while the project went to sleep anyway. This writes to a real table, which
 * is unambiguous database traffic, and still pings storage so both services
 * stay warm.
 *
 * The table is created once by hand (see the README); without it the response
 * says so rather than failing silently.
 */
const KEEPALIVE_TABLE = process.env.SUPABASE_KEEPALIVE_TABLE || 'keepalive';
const BUCKET_NAME = 'draw-cache';

async function pingDatabase(client) {
  // A write is activity no one can argue with, and it leaves a timestamp you
  // can read in the dashboard to confirm the cron is really running.
  const { data, error } = await client
    .from(KEEPALIVE_TABLE)
    .update({ pinged_at: new Date().toISOString() })
    .eq('id', 1)
    .select();

  if (!error) {
    return { ok: true, action: 'update', rows: data?.length ?? 0 };
  }

  // The table may not exist yet, or may have a different shape. Fall back to a
  // read, which still counts as database activity.
  const fallback = await client.from(KEEPALIVE_TABLE).select('id').limit(1);
  if (!fallback.error) {
    return { ok: true, action: 'select' };
  }

  return {
    ok: false,
    error: fallback.error.message || error.message,
    hint: `Create the table with: create table public.${KEEPALIVE_TABLE} (id int primary key default 1, pinged_at timestamptz not null default now());`,
  };
}

async function pingStorage(client) {
  const { error } = await client.storage
    .from(BUCKET_NAME)
    .list('', { limit: 1 });

  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Runs both pings and reports each one, so a glance at the response tells you
 * whether the thing that actually matters -- the database -- was reached.
 */
async function runKeepAlive(client = supabase) {
  const [database, storage] = await Promise.all([
    pingDatabase(client).catch((error) => ({ ok: false, error: error.message })),
    pingStorage(client).catch((error) => ({ ok: false, error: error.message })),
  ]);

  return {
    alive: database.ok,
    checkedAt: new Date().toISOString(),
    database,
    storage,
  };
}

module.exports = async (req, res) => {
  const report = await runKeepAlive();

  if (!report.alive) {
    console.error('Keep-alive could not reach the database:', report.database);
  }

  res.setHeader('Cache-Control', 'no-store');
  // 500 when the database was unreachable, so a cron monitor notices instead of
  // reporting success for a project that is drifting toward a pause.
  return res.status(report.alive ? 200 : 500).json(report);
};

module.exports.runKeepAlive = runKeepAlive;
module.exports.KEEPALIVE_TABLE = KEEPALIVE_TABLE;
