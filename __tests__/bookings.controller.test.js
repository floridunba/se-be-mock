const { createQuery, createRes } = require('../test-support/testUtils');

describe('bookings controller', () => {
  let Booking;
  let Campground;
  let CreditCard;
  let controller;

  beforeEach(() => {
    jest.resetModules();
    jest.doMock('../models/Booking', () => ({
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOne: jest.fn()
    }));
    jest.doMock('../models/Campground', () => ({
      findById: jest.fn()
    }));
    jest.doMock('../models/CreditCard', () => ({
      findById: jest.fn()
    }));
    Booking = require('../models/Booking');
    Campground = require('../models/Campground');
    CreditCard = require('../models/CreditCard');
    controller = require('../controllers/bookings');
  });

  test('getBookings for user and admin plus error', async () => {
    let req = { user: { id: 'u1', role: 'user' } };
    let res = createRes();
    let query = createQuery([{ id: 1 }]);
    Booking.find.mockReturnValueOnce(query);
    await controller.getBookings(req, res);
    expect(Booking.find).toHaveBeenCalledWith({ user: 'u1' });
    expect(res.status).toHaveBeenCalledWith(200);

    req = { user: { id: 'a1', role: 'admin' } };
    res = createRes();
    query = createQuery([{ id: 2 }]);
    Booking.find.mockReturnValueOnce(query);
    await controller.getBookings(req, res);
    expect(Booking.find).toHaveBeenCalledWith({});

    req = { user: { id: 'u1', role: 'user' } };
    res = createRes();
    query = createQuery([]);
    query.then = (resolve, reject) => Promise.reject(new Error('boom')).then(resolve, reject);
    Booking.find.mockReturnValueOnce(query);
    await controller.getBookings(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('getBooking handles success missing and error', async () => {
    let req = { params: { id: '1' } };
    let res = createRes();
    Booking.findById.mockReturnValueOnce(createQuery({ id: '1' }));
    await controller.getBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { id: '2' } };
    res = createRes();
    Booking.findById.mockReturnValueOnce(createQuery(null));
    await controller.getBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    req = { params: { id: '3' } };
    res = createRes();
    const badQuery = createQuery(null);
    badQuery.then = (resolve, reject) => Promise.reject(new Error('boom')).then(resolve, reject);
    Booking.findById.mockReturnValueOnce(badQuery);
    await controller.getBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('addBooking handles missing campground invalid duration success and error', async () => {
    let req = { params: { campgroundId: 'c1' }, user: { id: 'u1' }, body: { duration: 2 } };
    let res = createRes();
    Campground.findById.mockResolvedValueOnce(null);
    await controller.addBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    req = { params: { campgroundId: 'c1' }, user: { id: 'u1' }, body: { duration: 5 } };
    res = createRes();
    Campground.findById.mockResolvedValueOnce({ id: 'c1' });
    await controller.addBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { campgroundId: 'c1' }, user: { id: 'u1' }, body: { duration: 2 } };
    res = createRes();
    Campground.findById.mockResolvedValueOnce({ id: 'c1' });
    Booking.create.mockResolvedValueOnce({ id: 'b1' });
    await controller.addBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { campgroundId: 'c1' }, user: { id: 'u1' }, body: { duration: 2 } };
    res = createRes();
    Campground.findById.mockRejectedValueOnce(new Error('boom'));
    await controller.addBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('updateBooking handles all branches', async () => {
    let req = { params: { id: '1' }, user: { id: 'u1', role: 'user' }, body: {} };
    let res = createRes();
    Booking.findById.mockResolvedValueOnce(null);
    await controller.updateBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    req = { params: { id: '2' }, user: { id: 'u1', role: 'user' }, body: {} };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({ user: { toString: () => 'u2' } });
    await controller.updateBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(401);

    req = { params: { id: '3' }, user: { id: 'u1', role: 'user' }, body: { duration: 0 } };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
    await controller.updateBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '4' }, user: { id: 'u1', role: 'user' }, body: { duration: 2 } };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
    Booking.findByIdAndUpdate.mockResolvedValueOnce({ id: '4' });
    await controller.updateBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { id: '5' }, user: { id: 'u1', role: 'user' }, body: {} };
    res = createRes();
    Booking.findById.mockRejectedValueOnce(new Error('boom'));
    await controller.updateBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('deleteBooking handles all branches', async () => {
    let req = { params: { id: '1' }, user: { id: 'u1', role: 'user' } };
    let res = createRes();
    Booking.findById.mockResolvedValueOnce(null);
    await controller.deleteBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    req = { params: { id: '2' }, user: { id: 'u1', role: 'user' } };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({ user: { toString: () => 'u2' } });
    await controller.deleteBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(401);

    req = { params: { id: '3' }, user: { id: 'u1', role: 'user' } };
    res = createRes();
    const booking = { user: { toString: () => 'u1' }, deleteOne: jest.fn().mockResolvedValue(undefined) };
    Booking.findById.mockResolvedValueOnce(booking);
    await controller.deleteBooking(req, res);
    expect(booking.deleteOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { id: '4' }, user: { id: 'u1', role: 'user' } };
    res = createRes();
    Booking.findById.mockRejectedValueOnce(new Error('boom'));
    await controller.deleteBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('resumePayment handles all branches', async () => {
    let req = { params: { id: '1' }, user: { id: 'u1', role: 'user' } };
    let res = createRes();
    Booking.findById.mockReturnValueOnce(createQuery(null));
    await controller.resumePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    req = { params: { id: '2' }, user: { id: 'u1', role: 'user' } };
    res = createRes();
    Booking.findById.mockReturnValueOnce(createQuery({ user: { toString: () => 'u2' } }));
    await controller.resumePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(401);

    req = { params: { id: '3' }, user: { id: 'u1', role: 'user' } };
    res = createRes();
    Booking.findById.mockReturnValueOnce(createQuery({ user: { toString: () => 'u1' }, paymentStatus: 'paid' }));
    await controller.resumePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '4' }, user: { id: 'u1', role: 'user' } };
    res = createRes();
    const expired = {
      user: { toString: () => 'u1' },
      paymentStatus: 'pending',
      paymentExpiresAt: new Date(Date.now() - 1000),
      save: jest.fn().mockResolvedValue(undefined)
    };
    Booking.findById.mockReturnValueOnce(createQuery(expired));
    await controller.resumePayment(req, res);
    expect(expired.paymentStatus).toBe('expired');
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '5' }, user: { id: 'u1', role: 'user' } };
    res = createRes();
    const pending = {
      user: { toString: () => 'u1' },
      paymentStatus: 'pending',
      paymentExpiresAt: new Date(Date.now() + 5000)
    };
    Booking.findById.mockReturnValueOnce(createQuery(pending));
    await controller.resumePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { id: '6' }, user: { id: 'u1', role: 'user' } };
    res = createRes();
    const broken = createQuery(null);
    broken.then = (resolve, reject) => Promise.reject(new Error('boom')).then(resolve, reject);
    Booking.findById.mockReturnValueOnce(broken);
    await controller.resumePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('getOngoingBooking handles success missing and error', async () => {
    let req = { user: { id: 'u1' } };
    let res = createRes();
    Booking.findOne.mockReturnValueOnce(createQuery(null));
    await controller.getOngoingBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    req = { user: { id: 'u1' } };
    res = createRes();
    Booking.findOne.mockReturnValueOnce(createQuery({ id: 'b1' }));
    await controller.getOngoingBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { user: { id: 'u1' } };
    res = createRes();
    const broken = createQuery(null);
    broken.then = (resolve, reject) => Promise.reject(new Error('boom')).then(resolve, reject);
    Booking.findOne.mockReturnValueOnce(broken);
    await controller.getOngoingBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('payBooking handles all branches', async () => {
    let req = { params: { id: '1' }, user: { id: 'u1' }, body: {} };
    let res = createRes();
    Booking.findById.mockResolvedValueOnce(null);
    await controller.payBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    req = { params: { id: '2' }, user: { id: 'u1' }, body: {} };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({ user: { toString: () => 'u2' } });
    await controller.payBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(401);

    req = { params: { id: '3' }, user: { id: 'u1' }, body: {} };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
    await controller.payBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '4' }, user: { id: 'u1' }, body: { cardId: 'c1' } };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
    CreditCard.findById.mockResolvedValueOnce(null);
    await controller.payBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    req = { params: { id: '5' }, user: { id: 'u1' }, body: { cardId: 'c1' } };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u2' } });
    await controller.payBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(401);

    req = { params: { id: '6' }, user: { id: 'u1' }, body: { cardId: 'c1' } };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' }, paymentStatus: 'paid' });
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
    await controller.payBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '7' }, user: { id: 'u1' }, body: { cardId: 'c1' } };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' }, paymentStatus: 'cancelled' });
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
    await controller.payBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '8' }, user: { id: 'u1' }, body: { cardId: 'c1' } };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({
      user: { toString: () => 'u1' },
      paymentStatus: 'expired',
      paymentExpiresAt: new Date(Date.now() - 1000)
    });
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
    await controller.payBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '9' }, user: { id: 'u1' }, body: { cardId: 'c1' } };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({
      user: { toString: () => 'u1' },
      paymentStatus: 'pending',
      paymentExpiresAt: new Date(Date.now() + 1000),
      room: { price: 200 }
    });
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' }, balance: 100 });
    await controller.payBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '10' }, user: { id: 'u1' }, body: { cardId: 'c1' } };
    res = createRes();
    const booking = {
      user: { toString: () => 'u1' },
      paymentStatus: 'pending',
      paymentExpiresAt: new Date(Date.now() + 1000),
      room: { price: 200 },
      save: jest.fn().mockResolvedValue(undefined)
    };
    const card = {
      user: { toString: () => 'u1' },
      balance: 250,
      save: jest.fn().mockResolvedValue(undefined)
    };
    Booking.findById.mockResolvedValueOnce(booking);
    CreditCard.findById.mockResolvedValueOnce(card);
    await controller.payBooking(req, res);
    expect(booking.paymentStatus).toBe('paid');
    expect(card.balance).toBe(50);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { id: '11' }, user: { id: 'u1' }, body: { cardId: 'c1' } };
    res = createRes();
    Booking.findById.mockRejectedValueOnce(new Error('boom'));
    await controller.payBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('cancelPayment handles all branches', async () => {
    let req = { params: { id: '1' }, user: { id: 'u1' } };
    let res = createRes();
    Booking.findById.mockResolvedValueOnce(null);
    await controller.cancelPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    req = { params: { id: '2' }, user: { id: 'u1' } };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({ paymentStatus: 'paid' });
    await controller.cancelPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '3' }, user: { id: 'u1' } };
    res = createRes();
    Booking.findById.mockResolvedValueOnce({ paymentStatus: 'cancelled' });
    await controller.cancelPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '4' }, user: { id: 'u1' } };
    res = createRes();
    const booking = { paymentStatus: 'pending', save: jest.fn().mockResolvedValue(undefined) };
    Booking.findById.mockResolvedValueOnce(booking);
    await controller.cancelPayment(req, res);
    expect(booking.paymentStatus).toBe('cancelled');
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { id: '5' }, user: { id: 'u1' } };
    res = createRes();
    Booking.findById.mockRejectedValueOnce(new Error('boom'));
    await controller.cancelPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
