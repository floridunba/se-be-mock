describe('config/db', () => {
  test('connectDB sets strict query and connects', async () => {
    jest.resetModules();
    jest.doMock('mongoose', () => ({
      set: jest.fn(),
      connect: jest.fn().mockResolvedValue({ connection: { host: 'localhost' } })
    }));
    const mongoose = require('mongoose');
    const connectDB = require('../config/db');
    process.env.MONGO_URI = 'mongodb://example';

    await connectDB();

    expect(mongoose.set).toHaveBeenCalledWith('strictQuery', true);
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://example');
  });
});
