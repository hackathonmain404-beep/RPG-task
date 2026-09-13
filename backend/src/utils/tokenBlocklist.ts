import jwt from 'jsonwebtoken';

/**
 * In-memory Token Revocation Blocklist.
 * 
 * Tracks invalidated JWT tokens until their natural expiration timestamp.
 * Automatically prunes expired tokens to keep memory footprint bounded.
 */
class TokenBlocklist {
  // Map of token string -> expiration timestamp (milliseconds)
  private revokedTokens = new Map<string, number>();
  private lastPruneTime = Date.now();

  /**
   * Revoke a token until its expiration time.
   */
  revoke(token: string): void {
    try {
      const decoded = jwt.decode(token) as { exp?: number } | null;
      // Default to 7 days from now if exp is somehow not in token
      const expiryMs = decoded?.exp ? decoded.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
      this.revokedTokens.set(token, expiryMs);
      this.pruneIfNeeded();
    } catch {
      // If decoding fails, store with default 7-day TTL
      this.revokedTokens.set(token, Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Check if a token has been revoked.
   */
  isRevoked(token: string): boolean {
    const expiryMs = this.revokedTokens.get(token);
    if (!expiryMs) {
      return false;
    }

    if (Date.now() > expiryMs) {
      this.revokedTokens.delete(token);
      return false;
    }

    return true;
  }

  /**
   * Clear all revoked tokens (primarily for test resets).
   */
  clear(): void {
    this.revokedTokens.clear();
  }

  /**
   * Internal garbage collection to purge expired entries every 10 minutes.
   */
  private pruneIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastPruneTime > 10 * 60 * 1000) {
      this.lastPruneTime = now;
      for (const [token, expiryMs] of this.revokedTokens.entries()) {
        if (now > expiryMs) {
          this.revokedTokens.delete(token);
        }
      }
    }
  }
}

export const tokenBlocklist = new TokenBlocklist();
