describe('models and utils', () => {
  test('cardValidation covers valid and invalid inputs', () => {
    const { validateCardUpdateFields } = require('../utils/cardValidation');
    expect(validateCardUpdateFields({})).toEqual([]);

    const year = new Date().getFullYear() - 1;
    const errors = validateCardUpdateFields({
      cardHolderName: '',
      expiryMonth: 13,
      expiryYear: year,
      balance: -1,
      isDefault: true
    });

    expect(errors).toContain('Cardholder name cannot be empty');
    expect(errors).toContain('Invalid Expiry month');
    expect(errors).toContain(`Expiry year must be ${new Date().getFullYear()} or later`);
    expect(errors).toContain("Credit card's balance must be positive");
    expect(errors).toContain('Cannot edit isDefault in this request');
    expect(validateCardUpdateFields({ cardHolderName: 'x'.repeat(101) })).toContain(
      'Cardholder name cannot exceed 100 characters'
    );
  });

  test('User model methods and pre-save hook work', async () => {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    process.env.JWT_SECRET = 'secret';
    process.env.JWT_EXPIRE = '1d';

    const user = new User({ name: 'A', email: 'a@a.com', tel: '0123456789', password: 'secret' });
    const preSave = User.schema.s.hooks._pres.get('save')[2].fn;
    const genSaltSpy = jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt');
    const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed');
    await preSave.call(user, jest.fn());
    expect(user.password).toBe('hashed');

    const signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('signed');
    expect(user.getSignedJwtToken()).toBe('signed');

    const compareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    await expect(user.matchPassword('plain')).resolves.toBe(true);

    genSaltSpy.mockRestore();
    hashSpy.mockRestore();
    signSpy.mockRestore();
    compareSpy.mockRestore();
  });

  test('CreditCard model validator and pre-save hook work', async () => {
    const CreditCard = require('../models/CreditCard');
    const card = new CreditCard({
      user: '507f1f77bcf86cd799439011',
      cardNumber: '1234567812345678',
      last4: '5678',
      cardHolderName: 'A',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: new Date().getFullYear() + 1,
      CVV: '123',
      isDefault: true
    });

    expect(card.validateSync()).toBeUndefined();
    const expiredCard = new CreditCard({
      user: '507f1f77bcf86cd799439011',
      cardNumber: '1234567812345678',
      last4: '5678',
      cardHolderName: 'A',
      brand: 'visa',
      expiryMonth: 1,
      expiryYear: 2000,
      CVV: '123',
      isDefault: false
    });
    expect(expiredCard.validateSync().errors.expiryYear).toBeDefined();

    const preSave = CreditCard.schema.s.hooks._pres.get('save')[2].fn;
    card.constructor.findOne = jest.fn().mockResolvedValue(null);
    card.constructor.updateMany = jest.fn().mockResolvedValue(undefined);
    card.isModified = jest.fn().mockReturnValue(true);
    await preSave.call(card);
    expect(card.constructor.updateMany).toHaveBeenCalled();

    card.constructor.findOne = jest.fn().mockResolvedValue({});
    await expect(preSave.call(card)).rejects.toThrow('Card already exists for this user');
  });

  test('Booking Campground and Review models load expected schema metadata', () => {
    const Booking = require('../models/Booking');
    const Campground = require('../models/Campground');
    const Review = require('../models/Review');

    expect(Booking.schema.path('paymentStatus').options.enum).toContain('paid');
    expect(Campground.schema.virtuals.bookings).toBeDefined();
    expect(Review.schema.path('rating').options.required).toBe(true);
  });
});
