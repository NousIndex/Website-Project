// @vitest-environment node
/**
 * The keep-alive that this replaced pinged Storage only, so it reported
 * success while the project was pausing for database inactivity. These pin the
 * behaviour that matters: the database is what decides `alive`.
 */
import { describe, test, expect, beforeAll, vi } from 'vitest';

beforeAll(() => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_KEY = 'stub';
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

const { runKeepAlive } = await import('./keepalive.js');

/** Minimal stand-in for the supabase client's chained query builder. */
function makeClient({ updateError = null, selectError = null, storageError = null } = {}) {
  const calls = { update: 0, select: 0, storage: 0 };

  return {
    calls,
    from() {
      return {
        update() {
          calls.update++;
          return {
            eq() {
              return {
                select: async () => ({ data: updateError ? null : [{ id: 1 }], error: updateError }),
              };
            },
          };
        },
        select() {
          calls.select++;
          return {
            limit: async () => ({ data: selectError ? null : [{ id: 1 }], error: selectError }),
          };
        },
      };
    },
    storage: {
      from() {
        return {
          list: async () => {
            calls.storage++;
            return { data: [], error: storageError };
          },
        };
      },
    },
  };
}

describe('runKeepAlive', () => {
  test('writes to the database, not just storage', async () => {
    const client = makeClient();
    const report = await runKeepAlive(client);

    expect(report.alive).toBe(true);
    expect(report.database).toMatchObject({ ok: true, action: 'update' });
    expect(client.calls.update).toBe(1);
    expect(client.calls.storage).toBe(1);
  });

  test('falls back to a read when the row cannot be written', async () => {
    const client = makeClient({ updateError: { message: 'no rows' } });
    const report = await runKeepAlive(client);

    expect(report.alive).toBe(true);
    expect(report.database).toMatchObject({ ok: true, action: 'select' });
  });

  test('reports not-alive with a hint when the table is missing', async () => {
    const client = makeClient({
      updateError: { message: 'relation does not exist' },
      selectError: { message: 'relation "public.keepalive" does not exist' },
    });
    const report = await runKeepAlive(client);

    expect(report.alive).toBe(false);
    expect(report.database.hint).toContain('create table');
  });

  test('storage failing alone does not mark the project dead', async () => {
    const client = makeClient({ storageError: { message: 'bucket missing' } });
    const report = await runKeepAlive(client);

    expect(report.alive).toBe(true);
    expect(report.storage).toMatchObject({ ok: false });
  });

  test('a storage-only success is NOT reported as alive', async () => {
    // exactly the old behaviour, which is what let the project pause
    const client = makeClient({
      updateError: { message: 'relation does not exist' },
      selectError: { message: 'relation does not exist' },
    });
    const report = await runKeepAlive(client);

    expect(report.storage.ok).toBe(true);
    expect(report.alive).toBe(false);
  });
});
