import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Hashes a plain-text password using Node's built-in scrypt algorithm.
 * Returns a salt and hash joined by a colon.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against a stored salt:hash string.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const key = scryptSync(password, salt, 64);
  const hashBuffer = Buffer.from(hash, 'hex');
  return timingSafeEqual(key, hashBuffer);
}
