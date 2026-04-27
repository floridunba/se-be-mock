const { createRes } = require('../test-support/testUtils');

describe('credit cards controller', () => {
  let CreditCard;
  let controller;
  let saveMock;

  beforeEach(() => {
    jest.resetModules();
    saveMock = jest.fn();
    const CreditCardMock = jest.fn(function CreditCardMock(data) {
      Object.assign(this, data);
      this.save = saveMock;
    });
    CreditCardMock.find = jest.fn();
    CreditCardMock.findById = jest.fn();
    CreditCardMock.findByIdAndUpdate = jest.fn();
    jest.doMock('../models/CreditCard', () => CreditCardMock);
    jest.doMock('../utils/cardValidation', () => ({
      validateCardUpdateFields: jest.fn(() => [])
    }));
    CreditCard = require('../models/CreditCard');
    controller = require('../controllers/creditCards');
  });

  test('getCreditCards success and error', async () => {
    let req = { user: { id: 'u1' } };
    let res = createRes();
    CreditCard.find.mockResolvedValueOnce([{ id: 1 }]);
    await controller.getCreditCards(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { user: { id: 'u1' } };
    res = createRes();
    CreditCard.find.mockRejectedValueOnce(new Error('boom'));
    await controller.getCreditCards(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('getCreditCard success, not found, unauthorized and error', async () => {
    let req = { params: { id: '1' }, user: { id: 'u1', role: 'user' } };
    let res = createRes();
    CreditCard.findById.mockResolvedValueOnce(null);
    await controller.getCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    req = { params: { id: '2' }, user: { id: 'u1', role: 'user' } };
    res = createRes();
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u2' } });
    await controller.getCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(401);

    req = { params: { id: '3' }, user: { id: 'u1', role: 'admin' } };
    res = createRes();
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u2' } });
    await controller.getCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { id: '4' }, user: { id: 'u1', role: 'user' } };
    res = createRes();
    CreditCard.findById.mockRejectedValueOnce(new Error('boom'));
    await controller.getCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('addCreditCard success duplicate and generic error', async () => {
    let req = { user: { id: 'u1' }, body: { cardNumber: '1234567812345678' } };
    let res = createRes();
    saveMock.mockResolvedValueOnce(undefined);
    await controller.addCreditCard(req, res);
    expect(req.body.last4).toBe('5678');
    expect(res.status).toHaveBeenCalledWith(201);

    req = { user: { id: 'u1' }, body: { cardNumber: '1234567812345678' } };
    res = createRes();
    saveMock.mockRejectedValueOnce({ code: 11000 });
    await controller.addCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { user: { id: 'u1' }, body: { cardNumber: '1234567812345678' } };
    res = createRes();
    saveMock.mockRejectedValueOnce(new Error('save failed'));
    await controller.addCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('deleteCreditCard success not found unauthorized error', async () => {
    let req = { params: { id: '1' }, user: { id: 'u1', role: 'user' } };
    let res = createRes();
    CreditCard.findById.mockResolvedValueOnce(null);
    await controller.deleteCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    req = { params: { id: '2' }, user: { id: 'u1', role: 'user' } };
    res = createRes();
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u2' } });
    await controller.deleteCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(401);

    req = { params: { id: '3' }, user: { id: 'u1', role: 'admin' } };
    res = createRes();
    const card = { user: { toString: () => 'u2' }, deleteOne: jest.fn().mockResolvedValue(undefined) };
    CreditCard.findById.mockResolvedValueOnce(card);
    await controller.deleteCreditCard(req, res);
    expect(card.deleteOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { id: '4' }, user: { id: 'u1', role: 'user' } };
    res = createRes();
    CreditCard.findById.mockRejectedValueOnce(new Error('boom'));
    await controller.deleteCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('updateCreditCard covers validation and errors', async () => {
    const { validateCardUpdateFields } = require('../utils/cardValidation');

    let req = { params: { id: '1' }, user: { id: 'u1', role: 'user' }, body: {} };
    let res = createRes();
    CreditCard.findById.mockResolvedValueOnce(null);
    await controller.updateCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    req = { params: { id: '2' }, user: { id: 'u1', role: 'user' }, body: {} };
    res = createRes();
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u2' } });
    await controller.updateCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(401);

    req = { params: { id: '3' }, user: { id: 'u1', role: 'user' }, body: {} };
    res = createRes();
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
    validateCardUpdateFields.mockReturnValueOnce(['bad field']);
    await controller.updateCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '4' }, user: { id: 'u1', role: 'user' }, body: { cardNumber: '123' } };
    res = createRes();
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
    validateCardUpdateFields.mockReturnValueOnce([]);
    await controller.updateCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '5' }, user: { id: 'u1', role: 'user' }, body: { cardNumber: '1234 5678 1234 5678' } };
    res = createRes();
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
    validateCardUpdateFields.mockReturnValueOnce([]);
    CreditCard.findByIdAndUpdate.mockResolvedValueOnce({ id: '5' });
    await controller.updateCreditCard(req, res);
    expect(req.body.last4).toBe('5678');
    expect(res.status).toHaveBeenCalledWith(200);

    req = { params: { id: '6' }, user: { id: 'u1', role: 'user' }, body: {} };
    res = createRes();
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
    validateCardUpdateFields.mockReturnValueOnce([]);
    CreditCard.findByIdAndUpdate.mockRejectedValueOnce({
      name: 'ValidationError',
      errors: { a: { message: 'x' }, b: { message: 'y' } }
    });
    await controller.updateCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req = { params: { id: '7' }, user: { id: 'u1', role: 'user' }, body: {} };
    res = createRes();
    CreditCard.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
    validateCardUpdateFields.mockReturnValueOnce([]);
    CreditCard.findByIdAndUpdate.mockRejectedValueOnce(new Error('boom'));
    await controller.updateCreditCard(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
