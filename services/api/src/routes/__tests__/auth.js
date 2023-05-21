const jwt = require('jsonwebtoken');
const { assertMailSent } = require('postmark');
const { createTemporaryToken, generateTokenId } = require('../../utils/tokens');
const { request, createUser } = require('../../utils/testing');
const { mockTime, unmockTime, advanceTime } = require('../../utils/testing/time');
const { User, Invite } = require('../../models');
const { verifyPassword } = require('../../utils/auth');

const { generateSecret, generateToken } = require('../../utils/mfa');

describe('/1/auth', () => {
  describe('POST login', () => {
    it('should log in a user in', async () => {
      const password = '123password!';
      const user = await createUser({
        password,
      });
      const response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');
    });

    it('should login a user user with mfa enabled', async () => {
      const password = '123password!';
      const user = await createUser({
        password,
        mfaMethod: 'otp',
      });
      const response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      const { payload } = jwt.decode(response.body.data.mfaToken, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'mfa');
    });

    it('should throttle a few seconds after 5 bad attempts', async () => {
      mockTime('2020-01-01');

      const password = '123password!';
      const user = await createUser({
        password,
        loginAttempts: 5,
        lastLoginAttemptAt: new Date(),
      });
      let response;

      response = await request('POST', '/1/auth/login', { email: user.email, password: 'bad password' });

      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(401);

      advanceTime(60 * 1000);
      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      unmockTime();
    });

    it('should throttle 1 hour after 10 bad attempts', async () => {
      mockTime('2020-01-01');

      const password = '123password!';
      const user = await createUser({
        password,
        loginAttempts: 9,
        lastLoginAttemptAt: new Date(),
      });
      let response;

      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(401);

      advanceTime(60 * 60 * 1000);

      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      unmockTime();
    });

    it('should not throttle after successful login attempt', async () => {
      mockTime('2020-01-01');

      const password = '123password!';
      const user = await createUser({
        password,
        loginAttempts: 10,
        lastLoginAttemptAt: new Date(),
      });
      let response;

      advanceTime(60 * 60 * 1000);

      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      advanceTime(1000);

      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      unmockTime();
    });

    it('should store the new token payload on the user', async () => {
      const password = '123password!';
      let user = await createUser({
        password,
      });

      const response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);
      const decodeToken = jwt.decode(response.body.data.token, { complete: true });
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.authInfo).toHaveLength(1);
      const entry = updatedUser.authInfo[0];
      expect(entry.jti).toBe(decodeToken.payload.jti);
      expect(entry.exp.valueOf()).toBe(decodeToken.payload.exp * 1000);
    });
  });

  describe('POST /login/send-sms', () => {
    it('should send a sms', async () => {
      const phoneNumber = '+12312312422';
      const user = await createUser({
        phoneNumber,
      });

      let response = await request('POST', '/1/auth/login/send-sms', { phoneNumber }, {});
      expect(response.status).toBe(204);
      const dbUser = await User.findById(user.id);
      expect(dbUser.smsSecret).toBeTruthy();
    });

    it('should fail if no user is found', async () => {
      const phoneNumber = '+12312312324';
      let response = await request('POST', '/1/auth/login/send-sms', { phoneNumber }, {});
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Could not find a user with that phone number, try again!');
    });

    it('should block user if limit is reached', async () => {
      const phoneNumber = '+12318312324';
      await createUser({
        lastLoginAttemptAt: new Date(),
        loginAttempts: 10,
        phoneNumber,
      });
      let response = await request('POST', '/1/auth/login/send-sms', { phoneNumber });
      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('Too many attempts. Try again in 15 minute(s)');
    });
  });

  describe('POST /login/verify-sms', () => {
    it('should return a jwt token on success', async () => {
      const phoneNumber = '+123123123';
      const user = await createUser({
        phoneNumber,
        smsSecret: generateSecret(),
      });

      const response = await request(
        'POST',
        '/1/auth/login/verify-sms',
        { phoneNumber, code: generateToken(user.smsSecret) },
        {}
      );
      expect(response.status).toBe(200);
      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');
      const dbUser = await User.findById(user.id);
      expect(dbUser.authInfo[0].jti).toBe(payload.jti);
    });

    it('should failed with bad code', async () => {
      const phoneNumber = '+123123423';
      await createUser({
        phoneNumber,
        smsSecret: generateSecret(),
      });

      const response = await request('POST', '/1/auth/login/verify-sms', { phoneNumber, code: 'bad code' }, {});
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Invalid login code');
    });

    it('should block user if limit is reached', async () => {
      const phoneNumber = '+18182191291';
      await createUser({
        lastLoginAttemptAt: new Date(),
        loginAttempts: 10,
        phoneNumber,
      });
      let response = await request('POST', '/1/auth/login/verify-sms', { phoneNumber, code: 'bad code' }, {});
      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('Too many attempts. Try again in 15 minute(s)');
    });

    it('should handle mfa', async () => {
      const phoneNumber = '+18182191290';
      const user = await createUser({
        phoneNumber,
        smsSecret: generateSecret(),
        mfaMethod: 'otp',
      });

      const response = await request(
        'POST',
        '/1/auth/login/verify-sms',
        { phoneNumber, code: generateToken(user.smsSecret) },
        {}
      );
      expect(response.status).toBe(200);
      expect(response.body.data.mfaRequired).toBe(true);
    });
  });

  describe('POST /register', () => {
    it('should handle success', async () => {
      const email = 'some@email.com';
      const password = '123password!';
      const firstName = 'Bob';
      const lastName = 'Johnson';
      const phoneNumber = '+12312312422';
      let response = await request('POST', '/1/auth/register', {
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
      });
      expect(response.status).toBe(200);

      assertMailSent({ to: email });

      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');

      const dbUser = await User.findOne({
        email,
      });
      expect(dbUser.email).toBe(email);
      expect(dbUser.phoneNumber).toBe(phoneNumber);
      expect(dbUser.authInfo[0].jit).toBe(payload.jit);
      expect(dbUser.roles).toEqual([]);
    });

    it('should check for duplicating emails', async () => {
      const email = 'some@email.com';
      const password = '123password!';
      const firstName = 'Bob';
      const lastName = 'Johnson';
      await createUser({
        email: email,
      });

      let response = await request('POST', '/1/auth/register', { firstName, lastName, email, password });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('A user with that email already exists');
    });

    it('should check for duplicating phoneNumber', async () => {
      const email = 'some@email.com';
      const password = '123password!';
      const firstName = 'Bob';
      const lastName = 'Johnson';
      const phoneNumber = '+12312312422';
      await createUser({
        phoneNumber,
      });

      let response = await request('POST', '/1/auth/register', { firstName, lastName, phoneNumber, email, password });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('A user with that phone number already exists');
    });

    it('should allow just phonenumber without email/password', async () => {
      const firstName = 'Bob';
      const lastName = 'Johnson';
      const phoneNumber = '+12312342422';

      let response = await request('POST', '/1/auth/register', { firstName, lastName, phoneNumber });
      expect(response.status).toBe(200);
      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');

      const dbUser = await User.findOne({
        phoneNumber,
      });

      expect(dbUser.phoneNumber).toBe(phoneNumber);
      expect(dbUser.authInfo[0].jit).toBe(payload.jit);
      expect(dbUser.roles).toEqual([]);
    });

    it('should check required fields', async () => {
      const email = 'some2@email.com';
      const firstName = 'Bob';
      const lastName = 'Johnson';

      let response = await request('POST', '/1/auth/register', { email, firstName, lastName });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('"email" password is required when email is provided');

      response = await request('POST', '/1/auth/register', { firstName, lastName });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('email or phoneNumber is required');
    });
  });

  describe('POST /confirm-access', () => {
    it('should allow users to confirm they own the account by enter their password', async () => {
      const password = 'burgerfuntime';
      const user = await createUser({
        password,
        accessConfirmedAt: new Date(Date.now() - 1000),
      });

      const response = await request(
        'POST',
        '/1/auth/confirm-access',
        {
          password,
        },
        { user }
      );
      expect(response.status).toBe(204);
      const dbUser = await User.findById(user.id);
      expect(dbUser.accessConfirmedAt.valueOf()).toBeGreaterThan(user.accessConfirmedAt.valueOf());
    });

    it('should block user if limit is reached', async () => {
      const user = await createUser({
        lastLoginAttemptAt: new Date(),
        loginAttempts: 10,
      });
      let response = await request('POST', '/1/auth/confirm-access', { password: 'bad password' }, { user });
      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('Too many attempts. Try again in 15 minute(s)');
    });
  });

  describe('POST /logout', () => {
    it('should remove all tokens', async () => {
      const user = await createUser();

      const response = await request('POST', '/1/auth/logout', { all: true }, { user });
      expect(response.status).toBe(204);
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.authInfo).toHaveLength(0);
    });

    it('should remove current session if nothing is set', async () => {
      const user = await createUser({
        authInfo: [
          {
            jti: 'old session not expired',
            iat: '123',
            ip: '123',
            exp: new Date(Date.now() + 5000), // 5 seconds from now
            lastUsedAt: new Date(Date.now() - 1000),
          },
        ],
      });
      const response = await request('POST', '/1/auth/logout', {}, { user });
      expect(response.status).toBe(204);
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.authInfo).toHaveLength(1);
      expect(updatedUser.authInfo[0].jti).toBe('old session not expired');
    });

    it('should remove token by jit', async () => {
      const user = await createUser({
        authInfo: [
          {
            jti: 'targeted jti',
            iat: '123',
            ip: '123',
            exp: new Date(Date.now() + 5000), // 5 seconds from now
            lastUsedAt: new Date(Date.now() - 1000),
          },
        ],
      });
      const response = await request('POST', '/1/auth/logout', { jti: 'targeted jti' }, { user });
      expect(response.status).toBe(204);
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.authInfo).toHaveLength(1);
      // confirming that only authToken is from triggering the above request
      expect(updatedUser.authInfo[0].userAgent).toBe('testing library');
    });
  });

  describe('POST /accept-invite', () => {
    it('should send an email to the registered user', async () => {
      const invite = await Invite.create({
        email: 'some@email.com',
        status: 'invited',
      });
      const token = createTemporaryToken({ type: 'invite', inviteId: invite.id, email: invite.email });
      const response = await request(
        'POST',
        '/1/auth/accept-invite',
        {
          firstName: 'Bob',
          lastName: 'Johnson',
          password: '123password!',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status).toBe(200);

      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');

      const user = await User.findById(payload.sub);
      expect(user.firstName).toBe('Bob');
      expect(user.lastName).toBe('Johnson');
    });
  });

  describe('POST /request-password', () => {
    it('should send an email to the registered user', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/auth/request-password', {
        email: user.email,
      });
      expect(response.status).toBe(204);
      assertMailSent({ to: user.email });
    });

    it('should set a temporary token id', async () => {
      let user = await createUser();
      await request('POST', '/1/auth/request-password', {
        email: user.email,
      });
      user = await User.findById(user.id);
      expect(user.tempTokenId).not.toBeUndefined();
    });

    it('should return with 400 for unknown user', async () => {
      const email = 'email@email.com';
      const response = await request('POST', '/1/auth/request-password', {
        email,
      });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /set-password', () => {
    it('should allow a user to set a password', async () => {
      const tokenId = generateTokenId();
      const user = await createUser({
        tempTokenId: tokenId,
      });
      const password = 'very new password';
      const token = createTemporaryToken({ type: 'password', sub: user.id, jti: tokenId });
      const response = await request(
        'POST',
        '/1/auth/set-password',
        {
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status).toBe(200);

      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');

      const updatedUser = await User.findById(user.id);
      await expect(verifyPassword(updatedUser, password)).resolves.not.toThrow();
      expect(updatedUser.tempTokenId).not.toBeDefined();
      expect(updatedUser.authInfo).toHaveLength(1);
      expect(updatedUser.authInfo[0].jti).toContain(payload.jti);
    });

    it('should error when user is not found', async () => {
      const token = createTemporaryToken({ type: 'password', sub: 'invalid user' });
      const response = await request(
        'POST',
        '/1/auth/set-password',
        {
          password: 'new password',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status).toBe(400);
    });

    it('should only allow a token to be used once', async () => {
      const user = await createUser();
      const tokenId = generateTokenId();
      const token = createTemporaryToken({ type: 'password', sub: user.id, jti: tokenId });
      user.tempTokenId = tokenId;
      await user.save();
      let response = await request(
        'POST',
        '/1/auth/set-password',
        {
          password: 'new password',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(response.status).toBe(200);

      response = await request(
        'POST',
        '/1/auth/set-password',
        {
          password: 'even newer password!',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(response.status).toBe(400);
    });

    it('should not consume token on unsuccessful attempt', async () => {
      let user = await createUser();
      const tokenId = generateTokenId();
      const token = createTemporaryToken({ type: 'password', sub: user.id, jti: tokenId });
      user.tempTokenId = 'different id';
      await user.save();

      let response = await request(
        'POST',
        '/1/auth/set-password',
        {
          password: 'even newer password!',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(response.status).toBe(400);

      user = await User.findById(user.id);
      expect(user.tempTokenId).not.toBeUndefined();
    });

    it('should handle invalid tokens', async () => {
      const password = 'very new password';
      const response = await request(
        'POST',
        '/1/auth/set-password',
        {
          password,
        },
        {
          headers: {
            Authorization: 'Bearer badtoken',
          },
        }
      );
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: { type: 'token', message: 'bad jwt token', status: 401 } });
    });
  });
});
