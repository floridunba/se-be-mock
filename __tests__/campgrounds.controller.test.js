const { createQuery, createRes } = require('../test-support/testUtils');

describe('campgrounds controller', () => {
  let Campground;
  let Booking;
  let controller;

  beforeEach(() => {
    jest.resetModules();
    jest.doMock('../models/Campground.js', () => ({
      find: jest.fn(),
      countDocuments: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      deleteOne: jest.fn()
    }));
    jest.doMock('../models/Booking.js', () => ({
      deleteMany: jest.fn()
    }));
    Campground = require('../models/Campground.js');
    Booking = require('../models/Booking.js');
    controller = require('../controllers/campgrounds');
  });

  test('getCampgrounds supports filters and pagination', async () => {
    const req = { query: { select: 'name,address', sort: 'name', page: '2', limit: '1', price: { gte: 100 } } };
    const res = createRes();
    const query = createQuery([{ id: 1 }]);
    Campground.find.mockReturnValue(query);
    Campground.countDocuments.mockResolvedValue(3);

    await controller.getCampgrounds(req, res);

    expect(query.select).toHaveBeenCalledWith('name address');
    expect(query.sort).toHaveBeenCalledWith('name');
    expect(query.skip).toHaveBeenCalledWith(1);
    expect(query.limit).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getCampgrounds uses default sort and handles errors', async () => {
    const req = { query: {} };
    const res = createRes();
    const query = createQuery([]);
    Campground.find.mockReturnValue(query);
    Campground.countDocuments.mockRejectedValue(new Error('boom'));

    await controller.getCampgrounds(req, res);

    expect(query.sort).toHaveBeenCalledWith('-createAt');
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('getCampground returns 400 when missing', async () => {
    const req = { params: { id: '1' } };
    const res = createRes();
    Campground.findById.mockResolvedValue(null);

    await controller.getCampground(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('getCampground returns data', async () => {
    const req = { params: { id: '1' } };
    const res = createRes();
    Campground.findById.mockResolvedValue({ id: '1' });

    await controller.getCampground(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getCampground handles thrown errors', async () => {
    const req = { params: { id: '1' } };
    const res = createRes();
    Campground.findById.mockRejectedValue(new Error('boom'));

    await controller.getCampground(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('createCampground creates record', async () => {
    const req = { body: { name: 'Camp' } };
    const res = createRes();
    Campground.create.mockResolvedValue({ name: 'Camp' });

    await controller.createCampground(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('updateCampground returns 400 when missing', async () => {
    const req = { params: { id: '1' }, body: {} };
    const res = createRes();
    Campground.findByIdAndUpdate.mockResolvedValue(null);

    await controller.updateCampground(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateCampground returns updated data', async () => {
    const req = { params: { id: '1' }, body: { name: 'New' } };
    const res = createRes();
    Campground.findByIdAndUpdate.mockResolvedValue({ id: '1' });

    await controller.updateCampground(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('updateCampground handles errors', async () => {
    const req = { params: { id: '1' }, body: {} };
    const res = createRes();
    Campground.findByIdAndUpdate.mockRejectedValue(new Error('boom'));

    await controller.updateCampground(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('deleteCampground returns 400 when missing', async () => {
    const req = { params: { id: '1' } };
    const res = createRes();
    Campground.findById.mockResolvedValue(null);

    await controller.deleteCampground(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('deleteCampground deletes related bookings and campground', async () => {
    const req = { params: { id: '1' } };
    const res = createRes();
    Campground.findById.mockResolvedValue({ id: '1' });
    Booking.deleteMany.mockResolvedValue(undefined);
    Campground.deleteOne.mockResolvedValue(undefined);

    await controller.deleteCampground(req, res);

    expect(Booking.deleteMany).toHaveBeenCalledWith({ campground: '1' });
    expect(Campground.deleteOne).toHaveBeenCalledWith({ _id: '1' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deleteCampground handles errors', async () => {
    const req = { params: { id: '1' } };
    const res = createRes();
    Campground.findById.mockRejectedValue(new Error('boom'));

    await controller.deleteCampground(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
