const { generateSecret, generateToken } = require('../../utils/mfa');
const { createTemporaryToken, generateTokenId } = require('../../utils/tokens');
const { request, createUser } = require('../../utils/testing');
const { User } = require('../../models');
const jwt = require('jsonwebtoken');

describe('/1/mfa', () => {
  describe('POST /verify', () => {
    it('should verify mfa token', async () => {
      const user = await createUser({
        mfaMethod: 'otp',
        tempTokenId: generateTokenId(),
      });
      const secret = generateSecret();
      user.mfaSecret = secret;
      await user.save();
      const code = generateToken(secret);

      const token = createTemporaryToken({ type: 'mfa', sub: user.id, jti: user.tempTokenId });
      const response = await request(
        'POST',
        '/1/mfa/verify',
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');
    });

    it('should verify backup code', async () => {
      const backupCode = '12345-16123';
      const user = await createUser({
        mfaBackupCodes: [backupCode],
      });
      const token = createTemporaryToken({ type: 'mfa', sub: user.id, jti: user.tempTokenId });
      const response = await request(
        'POST',
        '/1/mfa/verify',
        { code: backupCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');
    });

    it('should failed with bad code', async () => {
      const user = await createUser({
        mfaMethod: 'otp',
        tempTokenId: generateTokenId(),
      });
      const secret = generateSecret();
      user.mfaSecret = secret;
      await user.save();
      const token = createTemporaryToken({ type: 'mfa', sub: user.id, jti: user.tempTokenId });
      const response = await request(
        'POST',
        '/1/mfa/verify',
        { code: 'bad code' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Not a valid code');
    });

    it('should failed with bad backup code', async () => {
      const badBackupCode = '12345-16123';
      const user = await createUser({});
      await user.save();
      const token = createTemporaryToken({ type: 'mfa', sub: user.id, jti: user.tempTokenId });
      const response = await request(
        'POST',
        '/1/mfa/verify',
        { code: badBackupCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Not a valid code');
    });

    it('should increase login attempts', async () => {
      const goodBackupCode = '92345-14812';
      const user = await createUser({
        mfaBackupCodes: [goodBackupCode],
        loginAttempts: 1,
      });
      await user.save();
      const token = createTemporaryToken({ type: 'mfa', sub: user.id, jti: user.tempTokenId });
      let response = await request(
        'POST',
        '/1/mfa/verify',
        { code: '123123' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const dbUser = await User.findById(user.id);
      expect(dbUser.loginAttempts).toBe(2);
      expect(response.status).toBe(400);
    });

    it('should block user if limit is reached', async () => {
      const goodBackupCode = '92345-14812';
      const user = await createUser({
        mfaBackupCodes: [goodBackupCode],
        loginAttempts: 10,
        lastLoginAttemptAt: new Date(),
      });
      await user.save();
      const token = createTemporaryToken({ type: 'mfa', sub: user.id, jti: user.tempTokenId });
      let response = await request(
        'POST',
        '/1/mfa/verify',
        { code: '123123' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('Too many attempts. Try again in 15 minute(s)');
    });
  });

  describe('POST /mfa/send-code', () => {
    it('should trigger a token being sent', async () => {
      const tokenId = generateTokenId();
      const user = await createUser({
        mfaMethod: 'sms',
        mfaSecret: generateSecret(),
        mfaPhoneNumber: '123123123',
        tempTokenId: tokenId,
      });
      const token = createTemporaryToken({ type: 'mfa', sub: user.id, jti: user.tempTokenId });
      let response = await request('POST', '/1/mfa/send-code', {}, { headers: { Authorization: `Bearer ${token}` } });
      expect(response.status).toBe(204);
    });
  });

  describe('POST /setup', () => {
    it('should allow mfa setup (otp)', async () => {
      const user = await createUser({
        accessConfirmedAt: new Date(),
      });
      const response = await request(
        'POST',
        `/1/mfa/setup`,
        {
          method: 'otp',
        },
        { user }
      );
      expect(response.status).toBe(200);
      expect(response.body.data.secret).toBeDefined();
    });

    it('should allow mfa setup (sms)', async () => {
      const user = await createUser({
        accessConfirmedAt: new Date(),
      });
      const response = await request(
        'POST',
        `/1/mfa/setup`,
        {
          method: 'sms',
          phoneNumber: '+4539406027',
        },
        { user }
      );
      expect(response.status).toBe(200);
      expect(response.body.data.secret).toBeDefined();
    });

    it('should fail if you access has not be validated', async () => {
      const user = await createUser({
        accessConfirmedAt: new Date(0),
      });
      const response = await request(
        'POST',
        `/1/mfa/setup`,
        {
          method: 'sms',
          phoneNumber: '+4539186027',
        },
        { user }
      );
      expect(response.status).toBe(403);
    });
  });

  describe('POST /enable', () => {
    it('should allow mfa to be enabled (otp)', async () => {
      const user = await createUser({
        accessConfirmedAt: new Date(),
      });
      const secret = generateSecret();

      const response = await request(
        'POST',
        `/1/mfa/enable`,
        {
          secret,
          method: 'otp',
          backupCodes: ['burger'],
        },
        { user }
      );
      expect(response.status).toBe(204);
      const dbUser = await User.findById(user.id);
      expect(dbUser.mfaSecret).toBe(secret);
      expect(dbUser.mfaMethod).toBe('otp');
      expect(dbUser.mfaBackupCodes[0]).toBe('burger');
    });

    it('should allow mfa to be enabled (sms)', async () => {
      const phoneNumber = '+4539386027';
      const user = await createUser({
        accessConfirmedAt: new Date(),
      });
      const secret = generateSecret();
      const response = await request(
        'POST',
        `/1/mfa/enable`,
        {
          phoneNumber,
          secret,
          method: 'sms',
          backupCodes: ['burger'],
        },
        { user }
      );
      expect(response.status).toBe(204);
      const dbUser = await User.findById(user.id);
      expect(dbUser.mfaSecret).toBe(secret);
      expect(dbUser.mfaMethod).toBe('sms');
      expect(dbUser.mfaBackupCodes[0]).toBe('burger');
      expect(dbUser.mfaPhoneNumber).toBe(phoneNumber);
    });

    it('should fail if you access has not be validated', async () => {
      const user = await createUser({
        accessConfirmedAt: new Date(0),
      });
      const response = await request(
        'POST',
        `/1/mfa/enable`,
        {
          secret: '1213123',
          method: 'otp',
          backupCodes: ['burger'],
        },
        { user }
      );
      expect(response.status).toBe(403);
    });
  });

  describe('POST /mfa/generate-backup-codes', () => {
    it('should generate new codes', async () => {
      const user = await createUser({});
      const response = await request('POST', `/1/mfa/generate-backup-codes`, {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.codes[0]).toBeDefined();
    });
  });

  describe('POST /check-code', () => {
    it('should verify a code', async () => {
      const user = await createUser({});
      const secret = generateSecret();
      const code = generateToken(secret);

      const response = await request(
        'POST',
        `/1/mfa/check-code`,
        {
          code,
          secret: secret,
          method: 'sms',
        },
        { user }
      );
      expect(response.status).toBe(204);
    });
  });
});
