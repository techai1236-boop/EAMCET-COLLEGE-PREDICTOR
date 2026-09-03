import crypto from 'node:crypto';

/**
 * Hash password securely using Node's crypto.scryptSync with a unique salt
 */
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

/**
 * Verify password using timingSafeEqual to protect against timing attacks
 */
export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const storedHashBuffer = Buffer.from(storedHash, 'hex');
    if (derivedKey.length !== storedHashBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(derivedKey, storedHashBuffer);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure random session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
