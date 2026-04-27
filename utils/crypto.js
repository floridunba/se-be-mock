const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Returns a 32-byte key from CARD_ENCRYPTION_KEY env var.
 * The env var must be a 64-char hex string (32 bytes).
 * Falls back to a deterministic dev key when NODE_ENV !== 'production'.
 */
function getKey() {
  const hex = process.env.CARD_ENCRYPTION_KEY;
  if (hex && hex.length === 64) {
    return Buffer.from(hex, 'hex');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CARD_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  // Dev fallback — NEVER use in production
  return Buffer.alloc(32, 0);
}

/**
 * Validate Luhn algorithm for card number.
 * @param {string} cardNumber  digits only (spaces stripped)
 * @returns {boolean}
 */
function luhnCheck(cardNumber) {
  const digits = cardNumber.replace(/\s+/g, '');
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
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

module.exports = { encrypt, decrypt, luhnCheck };
