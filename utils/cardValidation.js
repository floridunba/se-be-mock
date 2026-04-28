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
  const { cardHolderName, expiryMonth, expiryYear, balance, isDefault } = body;

  if (cardHolderName !== undefined) {
    if (typeof cardHolderName !== 'string' || cardHolderName.trim().length === 0) {
      errors.push('Cardholder name cannot be empty');
    }
    if (cardHolderName.length > 100) {
      errors.push('Cardholder name cannot exceed 100 characters');
    }
  }

  if (expiryMonth !== undefined) {
    const month = Number(expiryMonth);
    const now = new Date();
    const expiry = new Date(Number(expiryYear), month - 1, 1);
    // Card is valid through the end of the expiry month
    expiry.setMonth(expiry.getMonth() + 1);
    if (!Number.isInteger(month) || month < 1 || month > 12 || now > expiry) {
      errors.push('Invalid Expiry month');
    }
  }

  if (expiryYear !== undefined) {
    const year = Number(expiryYear);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < currentYear) {
      errors.push(`Expiry year must be ${currentYear} or later`);
    }
  }

  if (balance !== undefined) {
    if (balance < 0) {
        errors.push(`Credit card's balance must be positive`);
    }
  }

  if (isDefault !== undefined) {
    errors.push("Cannot edit isDefault in this request");
  }

  return errors;
}

module.exports = { validateCardUpdateFields };
