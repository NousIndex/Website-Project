// Base URL for the serverless functions in /api.
//
// In production the frontend and the functions share an origin, so an empty
// base (same-origin requests) is the right default. Set REACT_APP_API_URL only
// when pointing the local dev server at a deployed backend.
const configuredUrl = import.meta.env.REACT_APP_API_URL || '';

export const API_URL = configuredUrl
  ? configuredUrl.replace(/\/?$/, '/')
  : '/';
