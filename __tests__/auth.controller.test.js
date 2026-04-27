const { createRes } = require('../test-support/testUtils');

describe('auth controller', () => {
  let User;
  let auth;

  beforeEach(() => {
    jest.resetModules();
    jest.doMock('../models/User', () => ({
      create: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn()
    }));
    User = require('../models/User');
    auth = require('../controllers/auth');
    process.env.JWT_COOKIE_EXPIRE = '1';
    process.env.NODE_ENV = 'test';
  });

  test('register success sends token response', async () => {
    const req = { body: { name: 'A', email: 'a@a.com', tel: '0123456789', password: 'secret', role: 'user' } };
    const res = createRes();
    const user = { getSignedJwtToken: jest.fn().mockReturnValue('token-1') };
    User.create.mockResolvedValue(user);

    await auth.register(req, res);

    expect(User.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true, token: 'token-1' });
  });

  test('register failure returns 400', async () => {
    const req = { body: {} };
    const res = createRes();
    User.create.mockRejectedValue(new Error('boom'));

    await auth.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false });
  });

  test('login rejects missing credentials', async () => {
    const req = { body: { email: '', password: '' } };
    const res = createRes();

    await auth.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('login rejects unknown user', async () => {
    const req = { body: { email: 'a@a.com', password: 'x' } };
    const res = createRes();
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await auth.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('login rejects bad password', async () => {
    const req = { body: { email: 'a@a.com', password: 'x' } };
    const res = createRes();
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        matchPassword: jest.fn().mockResolvedValue(false)
      })
    });

    await auth.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('login success in production uses secure cookie', async () => {
    process.env.NODE_ENV = 'production';
    const req = { body: { email: 'a@a.com', password: 'x' } };
    const res = createRes();
    const user = {
      matchPassword: jest.fn().mockResolvedValue(true),
      getSignedJwtToken: jest.fn().mockReturnValue('token-2')
    };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    await auth.login(req, res);

    expect(res.cookie.mock.calls[0][2].secure).toBe(true);
    expect(res.json).toHaveBeenCalledWith({ success: true, token: 'token-2' });
  });

  test('getMe returns current user', async () => {
    const req = { user: { id: 'u1' } };
    const res = createRes();
    User.findById.mockResolvedValue({ id: 'u1' });

    await auth.getMe(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('logout clears cookie', async () => {
    const res = createRes();

    await auth.logout({}, res);

    expect(res.cookie).toHaveBeenCalledWith('token', 'none', expect.objectContaining({ httpOnly: true }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('updateDetails success', async () => {
    const req = { user: { id: 'u1' }, body: { name: 'B', tel: '0999999999' } };
    const res = createRes();
    User.findByIdAndUpdate.mockResolvedValue({ id: 'u1', name: 'B' });

    await auth.updateDetails(req, res, jest.fn());

    expect(User.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('updateDetails passes errors to next', async () => {
    const req = { user: { id: 'u1' }, body: {} };
    const res = createRes();
    const next = jest.fn();
    const err = new Error('fail');
    User.findByIdAndUpdate.mockRejectedValue(err);

    await auth.updateDetails(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  test('updatePassword rejects incorrect password', async () => {
    const req = { user: { id: 'u1' }, body: { currentPassword: 'old', newPassword: 'new' } };
    const res = createRes();
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        matchPassword: jest.fn().mockResolvedValue(false)
      })
    });

    await auth.updatePassword(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('updatePassword success', async () => {
    const req = { user: { id: 'u1' }, body: { currentPassword: 'old', newPassword: 'new' } };
    const res = createRes();
    const user = {
      matchPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(undefined)
    };
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    await auth.updatePassword(req, res, jest.fn());

    expect(user.password).toBe('new');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('updatePassword passes errors to next', async () => {
    const req = { user: { id: 'u1' }, body: {} };
    const res = createRes();
    const next = jest.fn();
    const err = new Error('fail');
    User.findById.mockReturnValue({ select: jest.fn().mockRejectedValue(err) });

    await auth.updatePassword(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});
