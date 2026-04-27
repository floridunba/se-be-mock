function buildRouter() {
  return {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    route: jest.fn(function route() {
      return {
        get: jest.fn().mockReturnThis(),
        post: jest.fn().mockReturnThis(),
        put: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis()
      };
    }),
    use: jest.fn()
  };
}

describe('routes', () => {
  test('auth routes wire handlers', () => {
    jest.resetModules();
    jest.unmock('../routes/auth');
    const router = buildRouter();
    jest.doMock('express', () => ({ Router: jest.fn(() => router) }));
    jest.doMock('../controllers/auth', () => ({
      register: jest.fn(),
      login: jest.fn(),
      getMe: jest.fn(),
      logout: jest.fn(),
      updateDetails: jest.fn(),
      updatePassword: jest.fn()
    }));
    jest.doMock('../middleware/auth', () => ({ protect: jest.fn() }));
    require('../routes/auth');
    expect(router.post).toHaveBeenCalledTimes(2);
    expect(router.get).toHaveBeenCalledTimes(2);
    expect(router.put).toHaveBeenCalledTimes(2);
  });

  test('bookings routes wire handlers and middleware', () => {
    jest.resetModules();
    jest.unmock('../routes/bookings');
    const router = buildRouter();
    jest.doMock('express', () => ({ Router: jest.fn(() => router) }));
    jest.doMock('../controllers/bookings', () => ({
      getBookings: jest.fn(),
      getBooking: jest.fn(),
      addBooking: jest.fn(),
      updateBooking: jest.fn(),
      deleteBooking: jest.fn(),
      payBooking: jest.fn(),
      resumePayment: jest.fn(),
      cancelPayment: jest.fn()
    }));
    jest.doMock('../middleware/auth', () => ({ protect: jest.fn(), authorize: jest.fn(() => jest.fn()) }));
    jest.doMock('../middleware/validateCanclePayment', () => jest.fn());
    require('../routes/bookings');
    expect(router.route).toHaveBeenCalled();
  });

  test('campgrounds routes mount nested routers', () => {
    jest.resetModules();
    jest.unmock('../routes/campgrounds');
    const router = buildRouter();
    jest.doMock('express', () => ({ Router: jest.fn(() => router) }));
    jest.doMock('../controllers/campgrounds', () => ({
      getCampgrounds: jest.fn(),
      getCampground: jest.fn(),
      createCampground: jest.fn(),
      updateCampground: jest.fn(),
      deleteCampground: jest.fn()
    }));
    jest.doMock('../middleware/auth', () => ({ protect: jest.fn(), authorize: jest.fn(() => jest.fn()) }));
    jest.doMock('../routes/reviews', () => ({}));
    jest.doMock('../routes/bookings', () => ({}));
    require('../routes/campgrounds');
    expect(router.use).toHaveBeenCalledTimes(2);
  });

  test('creditCards routes wire handlers', () => {
    jest.resetModules();
    jest.unmock('../routes/creditCards');
    const router = buildRouter();
    jest.doMock('express', () => ({ Router: jest.fn(() => router) }));
    jest.doMock('../middleware/auth', () => ({ protect: jest.fn(), authorize: jest.fn(() => jest.fn()) }));
    jest.doMock('../controllers/creditCards', () => ({
      addCreditCard: jest.fn(),
      getCreditCards: jest.fn(),
      getCreditCard: jest.fn(),
      deleteCreditCard: jest.fn(),
      updateCreditCard: jest.fn()
    }));
    require('../routes/creditCards');
    expect(router.route).toHaveBeenCalledTimes(2);
  });

  test('reviews routes wire handlers', () => {
    jest.resetModules();
    jest.unmock('../routes/reviews');
    const router = buildRouter();
    jest.doMock('express', () => ({ Router: jest.fn(() => router) }));
    jest.doMock('../controllers/reviews', () => ({
      getReviews: jest.fn(),
      createReview: jest.fn(),
      updateReview: jest.fn(),
      deleteReview: jest.fn()
    }));
    jest.doMock('../middleware/auth', () => ({ protect: jest.fn(), authorize: jest.fn(() => jest.fn()) }));
    require('../routes/reviews');
    expect(router.route).toHaveBeenCalledTimes(4);
  });
});
