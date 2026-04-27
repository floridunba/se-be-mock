/**
 * Validation utilities for credit card update requests.
 */

/**
 * Validate fields for card update.
 * Returns an array of error messages; empty means valid.
 * @param {object} body  - req.body fields
 * @returns {string[]}
 */
function validateCardUpdateFields(body) {
  const errors = [];
  const { cardholderName, expiryMonth, expiryYear } = body;

  if (cardholderName !== undefined) {
    if (typeof cardholderName !== 'string' || cardholderName.trim().length === 0) {
      errors.push('Cardholder name cannot be empty');
    }
    if (cardholderName.length > 100) {
      errors.push('Cardholder name cannot exceed 100 characters');
    }
  }

  if (expiryMonth !== undefined) {
    const month = Number(expiryMonth);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      errors.push('Expiry month must be between 1 and 12');
    }
  }

  if (expiryYear !== undefined) {
    const year = Number(expiryYear);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < currentYear) {
      errors.push(`Expiry year must be ${currentYear} or later`);
    }
  }

  return errors;
}

module.exports = { validateCardUpdateFields };
