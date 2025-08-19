import * as crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'defaultencryptionkey123'; // Must be 32 chars
const IV_LENGTH = 16;

export class EncryptionUtil {
  /**
   * Encrypts a plaintext string using AES-256-CBC.
   */
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypts an encrypted string using AES-256-CBC.
   */
  static decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Generates a random secret or token.
   */
  static generateRandomString(length = 32): string {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
  }

  /**
   * Hash string using SHA-256 (e.g. for fingerprinting).
   */
  static sha256Hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
