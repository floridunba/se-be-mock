const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Returns a 32-byte key from CARD_ENCRYPTION_KEY env var.
 * The env var must be a 64-char hex string (32 bytes).
 */
function getKey() {
  const hex = process.env.CARD_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('CARD_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Encrypt plaintext string with AES-256-CBC.
 * Returns "iv_hex:encrypted_hex"
 * @param {string} plaintext
 * @returns {string}
 */
function encrypt(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plaintext)), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypt ciphertext produced by encrypt().
 * @param {string} ciphertext  "iv_hex:encrypted_hex"
 * @returns {string}
 */
function decrypt(ciphertext) {
  const key = getKey();
  const [ivHex, encHex] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };
