import supabase from '../Pages/Supabase';
import { API_URL } from '../API_Config.js';

/**
 * Thin wrapper around fetch for the /api functions.
 *
 * It attaches the Supabase access token when a call needs one, turns non-2xx
 * responses into thrown errors instead of letting an error object flow into
 * component state, and always resolves to parsed JSON.
 */
export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) {
    throw new ApiError('Not signed in', 401, null);
  }
  return { Authorization: `Bearer ${token}` };
}

export async function apiFetch(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) Object.assign(headers, await authHeader());

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.error || payload?.message || `Request failed (${response.status})`,
      response.status,
      payload
    );
  }

  return payload;
}

/**
 * For calls where an empty result is a normal outcome (no draws yet, no
 * watchlist saved): logs the failure and returns the fallback instead of
 * throwing, so a failed request can never put a non-array into list state.
 */
export async function apiFetchOr(fallback, path, options) {
  try {
    const data = await apiFetch(path, options);
    return data ?? fallback;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status >= 500) {
      console.error(`API request failed: ${path}`, error);
    }
    return fallback;
  }
}
