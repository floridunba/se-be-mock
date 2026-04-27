describe('server', () => {
  test('server bootstraps middleware and handles unhandled rejections', () => {
    jest.resetModules();

    const app = {
      use: jest.fn(),
      set: jest.fn(),
      listen: jest.fn((port, cb) => {
        if (cb) {
          cb();
        }
        return serverInstance;
      })
    };
    const serverInstance = {
      close: jest.fn((cb) => cb())
    };
    const expressMock = jest.fn(() => app);
    expressMock.json = jest.fn(() => 'json-mw');

    const onSpy = jest.spyOn(process, 'on').mockImplementation(jest.fn());
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    jest.doMock('node:dns/promises', () => ({ setServers: jest.fn() }));
    jest.doMock('express', () => expressMock);
    jest.doMock('dotenv', () => ({ config: jest.fn() }));
    jest.doMock('cookie-parser', () => jest.fn(() => 'cookie'));
    jest.doMock('./config/db', () => jest.fn(), { virtual: true });
    jest.doMock('../config/db', () => jest.fn());
    jest.doMock('../routes/campgrounds', () => 'campgrounds');
    jest.doMock('../routes/auth', () => 'auth');
    jest.doMock('../routes/bookings', () => 'bookings');
    jest.doMock('../routes/reviews', () => 'reviews');
    jest.doMock('../routes/creditCards', () => 'cards');
    jest.doMock('express-mongo-sanitize', () => jest.fn(() => 'sanitize'));
    jest.doMock('helmet', () => jest.fn(() => 'helmet'));
    jest.doMock('express-xss-sanitizer', () => ({ xss: jest.fn(() => 'xss') }));
    jest.doMock('express-rate-limit', () => jest.fn(() => 'limiter'));
    jest.doMock('hpp', () => jest.fn(() => 'hpp'));
    jest.doMock('cors', () => jest.fn(() => 'cors'));

    process.env.PORT = '5555';
    process.env.NODE_ENV = 'test';
    require('../server');

    expect(expressMock).toHaveBeenCalled();
    expect(app.use).toHaveBeenCalled();
    expect(app.set).toHaveBeenCalledWith('query parser', 'extended');
    expect(app.listen).toHaveBeenCalledWith('5555', undefined);

    const rejectionHandler = onSpy.mock.calls.find((call) => call[0] === 'unhandledRejection')[1];
    rejectionHandler(new Error('boom'));
    expect(serverInstance.close).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);

    onSpy.mockRestore();
    exitSpy.mockRestore();
    logSpy.mockRestore();
  });
});
