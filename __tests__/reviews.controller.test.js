const { createQuery, createRes } = require('../test-support/testUtils');

describe('reviews controller', () => {
  let Review;
  let Campground;
  let controller;

  beforeEach(() => {
    jest.resetModules();
    jest.doMock('../models/Review', () => ({
      find: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn()
    }));
    jest.doMock('../models/Campground', () => ({
      findById: jest.fn()
    }));
    Review = require('../models/Review');
    Campground = require('../models/Campground');
    controller = require('../controllers/reviews');
  });

  test('getReviews covers all query branches and error', async () => {
    let req = { params: { campgroundId: 'c1' }, user: { id: 'u1', role: 'user' } };
    let res = createRes();
    Review.find.mockReturnValueOnce(createQuery([{ id: 1 }]));
    await controller.getReviews(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { campgroundId: 'c1' }, user: { id: 'a1', role: 'admin' } };
    res = createRes();
    Review.find.mockReturnValueOnce(createQuery([{ id: 2 }]));
    await controller.getReviews(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: {}, user: { id: 'u1', role: 'user' } };
    res = createRes();
    Review.find.mockReturnValueOnce(createQuery([{ id: 3 }]));
    await controller.getReviews(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: {}, user: { id: 'a1', role: 'admin' } };
    res = createRes();
    Review.find.mockReturnValueOnce(createQuery([{ id: 4 }]));
    await controller.getReviews(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: {}, user: { id: 'u1', role: 'user' } };
    res = createRes();
    const badQuery = createQuery([]);
    badQuery.then = (resolve, reject) => Promise.reject(new Error('boom')).then(resolve, reject);
    Review.find.mockReturnValueOnce(badQuery);
    await controller.getReviews(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('createReview covers truthy review, falsy review and next on error', async () => {
    let req = { params: { campgroundId: 'c1' }, user: { id: 'u1' }, body: { rating: 5, comment: 'nice' } };
    let res = createRes();
    const campground = { save: jest.fn().mockResolvedValue(undefined) };
    const review = { save: jest.fn().mockResolvedValue(undefined) };
    Review.create.mockResolvedValueOnce(review);
    Campground.findById.mockResolvedValueOnce(campground);
    Review.find.mockResolvedValueOnce([{ rating: 5 }, { rating: 3 }]);
    await controller.createReview(req, res, jest.fn());
    expect(campground.totalReviews).toBe(2);
    expect(campground.averageRating).toBe(4);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { campgroundId: 'c2' }, user: { id: 'u1' }, body: { rating: 4, comment: 'ok' } };
    res = createRes();
    const campground2 = { save: jest.fn().mockResolvedValue(undefined) };
    const review2 = { save: jest.fn().mockResolvedValue(undefined) };
    Review.create.mockResolvedValueOnce(null).mockResolvedValueOnce(review2);
    Campground.findById.mockResolvedValueOnce(campground2);
    Review.find.mockResolvedValueOnce([{ rating: 4 }]);
    await controller.createReview(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { campgroundId: 'c3' }, user: { id: 'u1' }, body: { rating: 4 } };
    res = createRes();
    const next = jest.fn();
    const err = new Error('boom');
    Review.create.mockRejectedValueOnce(err);
    await controller.createReview(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  test('updateReview covers unauthorized success and error', async () => {
    let req = { params: { id: '1' }, user: { id: 'u1', role: 'user' }, body: {} };
    let res = createRes();
    Review.findById.mockResolvedValueOnce({ user: { toString: () => 'u2' } });
    await controller.updateReview(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '2' }, user: { id: 'u1', role: 'admin' }, body: { rating: 3 } };
    res = createRes();
    Review.findById.mockResolvedValueOnce({ user: { toString: () => 'u2' } });
    Review.findByIdAndUpdate.mockResolvedValueOnce({ id: '2' });
    await controller.updateReview(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { id: '3' }, user: { id: 'u1', role: 'user' }, body: {} };
    res = createRes();
    Review.findById.mockRejectedValueOnce(new Error('boom'));
    await controller.updateReview(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('deleteReview covers unauthorized success and error', async () => {
    let req = { params: { id: '1' }, user: { id: 'u1', role: 'user' } };
    let res = createRes();
    Review.findById.mockResolvedValueOnce({ user: { toString: () => 'u2' } });
    await controller.deleteReview(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '2' }, user: { id: 'u1', role: 'admin' } };
    res = createRes();
    const review = { user: { toString: () => 'u2' }, deleteOne: jest.fn().mockResolvedValue(undefined) };
    Review.findById.mockResolvedValueOnce(review);
    await controller.deleteReview(req, res);
    expect(review.deleteOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { id: '3' }, user: { id: 'u1', role: 'user' } };
    res = createRes();
    Review.findById.mockRejectedValueOnce(new Error('boom'));
    await controller.deleteReview(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
