const { supabase } = require('./supabase');

/**
 * Verifies the Supabase access token on a request and returns the user id.
 *
 * The client sends its session token as `Authorization: Bearer <jwt>`; the id
 * always comes from the verified token, never from the query string or body,
 * so a caller cannot act on behalf of another account.
 *
 * @returns {Promise<{ userId: string } | { error: string, status: number }>}
 */
async function getAuthenticatedUserId(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token) {
    return { error: 'Missing authentication token', status: 401 };
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return { error: 'Invalid authentication token', status: 401 };
    }
    return { userId: data.user.id };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { error: 'Could not verify authentication', status: 500 };
  }
}

/**
 * Wraps a handler so it only runs for a verified caller. The verified user id
 * is passed as the third argument.
 */
function withAuth(handler) {
  return async (req, res, ...rest) => {
    const auth = await getAuthenticatedUserId(req);
    if (auth.error) {
      return res.status(auth.status).json({ error: auth.error });
    }
    return handler(req, res, auth.userId, ...rest);
  };
}

module.exports = { getAuthenticatedUserId, withAuth };
