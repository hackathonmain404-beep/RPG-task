const DEFAULT_DEV_FALLBACK = 'super_secret_session_key_32_characters_minimum_rpg';

/**
 * Retrieves and validates the JWT/Session signing secret.
 * Priority: JWT_SECRET -> SESSION_SECRET -> fallback (non-production only).
 * 
 * In production, strictly throws an error if secret is missing or insecure (< 32 chars or default fallback).
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!secret) {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET or SESSION_SECRET must be configured in production.');
    }
    if (secret === DEFAULT_DEV_FALLBACK || secret.includes('replace_me') || secret.length < 32) {
      throw new Error('FATAL SECURITY ERROR: JWT/SESSION secret is too weak or using default placeholder. Minimum 32 characters required.');
    }
    return secret;
  }

  return secret || DEFAULT_DEV_FALLBACK;
}
