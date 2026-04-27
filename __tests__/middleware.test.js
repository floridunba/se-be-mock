const { createRes } = require('../test-support/testUtils');

describe('middleware', () => {
  test('protect handles missing token, success and invalid token', async () => {
    jest.resetModules();
    jest.doMock('jsonwebtoken', () => ({ verify: jest.fn() }));
    jest.doMock('../models/User', () => ({ findById: jest.fn() }));
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    const { protect } = require('../middleware/auth');
    process.env.JWT_SECRET = 'secret';

    let req = { headers: {} };
    let res = createRes();
    let next = jest.fn();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);

    req = { headers: { authorization: 'Bearer abc' } };
    res = createRes();
    next = jest.fn();
    jwt.verify.mockReturnValueOnce({ id: 'u1' });
    User.findById.mockResolvedValueOnce({ id: 'u1', role: 'user' });
    await protect(req, res, next);
    expect(req.user).toEqual({ id: 'u1', role: 'user' });
    expect(next).toHaveBeenCalled();

    req = { headers: { authorization: 'Bearer abc' } };
    res = createRes();
    next = jest.fn();
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('bad');
    });
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('authorize enforces roles', () => {
    const { authorize } = require('../middleware/auth');
    const allow = authorize('admin', 'user');
    const next = jest.fn();
    let res = createRes();
    allow({ user: { role: 'user' } }, res, next);
    expect(next).toHaveBeenCalled();

    res = createRes();
    allow({ user: { role: 'guest' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('validateCancelPayment covers all branches', async () => {
    jest.resetModules();
    jest.doMock('../models/Booking', () => ({ findById: jest.fn() }));
    const Booking = require('../models/Booking');
    const validateCancelPayment = require('../middleware/validateCanclePayment');

    let req = { params: { id: '1' } };
    let res = createRes();
    let next = jest.fn();
    Booking.findById.mockResolvedValueOnce(null);
    await validateCancelPayment(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);

    req = { params: { id: '2' } };
    res = createRes();
    next = jest.fn();
    Booking.findById.mockResolvedValueOnce({ paymentStatus: 'paid' });
    await validateCancelPayment(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '3' } };
    res = createRes();
    next = jest.fn();
    Booking.findById.mockResolvedValueOnce({ paymentStatus: 'cancelled' });
    await validateCancelPayment(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '4' } };
    res = createRes();
    next = jest.fn();
    const booking = { paymentStatus: 'pending' };
    Booking.findById.mockResolvedValueOnce(booking);
    await validateCancelPayment(req, res, next);
    expect(req.booking).toBe(booking);
    expect(next).toHaveBeenCalled();

    req = { params: { id: '5' } };
    res = createRes();
    next = jest.fn();
    Booking.findById.mockRejectedValueOnce(new Error('boom'));
    await validateCancelPayment(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
