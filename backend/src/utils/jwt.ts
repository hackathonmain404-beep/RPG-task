const SECURE_FALLBACK = 'liferpg_production_secure_jwt_token_secret_key_2026_xyz_safe_fallback_key';

/**
 * Retrieves and validates the JWT/Session signing secret.
 * Priority: JWT_SECRET -> SESSION_SECRET -> fallback key.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;

  if (secret && secret.length >= 16 && !secret.includes('replace_me')) {
    return secret;
  }

  return SECURE_FALLBACK;
}
