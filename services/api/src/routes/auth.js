const Router = require('@koa/router');
const Joi = require('joi');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { createAuthToken, createTemporaryToken, generateTokenId } = require('../utils/tokens');
const { sendTemplatedMail } = require('../utils/mailer');
const { User, Invite, AuditEntry } = require('../models');

const mfa = require('../utils/mfa');
const { verifyLoginAttempts, verifyPassword } = require('../utils/auth');

const router = new Router();

const passwordField = Joi.string()
  .trim()
  .min(12)
  .message('Your password must be at least 12 characters long. Please try another.');

router
  .post(
    '/register',
    validateBody({
      email: Joi.string().lowercase().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      password: passwordField.required(),
    }),
    async (ctx) => {
      const { email } = ctx.request.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        ctx.throw(400, 'A user with that email already exists');
      }

      const user = new User({
        ...ctx.request.body,
      });
      const { token, payload } = createAuthToken(user);
      user.addAuthToken(payload, ctx);
      await user.save();

      await AuditEntry.append('Registered', ctx, {
        object: user,
        user: user.id,
      });

      await sendTemplatedMail({
        user,
        file: 'welcome.md',
      });

      ctx.body = {
        data: { token },
      };
    }
  )
  .post(
    '/login',
    validateBody({
      email: Joi.string().email().trim().required(),
      password: Joi.string().trim().required(),
    }),

    async (ctx) => {
      const { email, password } = ctx.request.body;
      const user = await User.findOne({ email });

      if (!user) {
        ctx.throw(401, 'Incorrect password');
      }

      try {
        await verifyLoginAttempts(user);
      } catch (error) {
        await AuditEntry.append('Reached max authentication attempts', ctx, {
          category: 'security',
          object: user,
          user: user.id,
        });
        ctx.throw(401, error);
      }

      try {
        await verifyPassword(user, password);
      } catch (error) {
        await AuditEntry.append('Failed authentication', ctx, {
          category: 'security',
          object: user,
          user: user.id,
        });
        ctx.throw(401, error);
      }

      if (await mfa.requireChallenge(ctx, user)) {
        const tokenId = generateTokenId();
        const mfaToken = createTemporaryToken({ type: 'mfa', sub: user.id, jti: tokenId });
        user.tempTokenId = tokenId;
        await user.save();
        ctx.body = {
          data: {
            mfaToken,
            mfaRequired: true,
            mfaMethod: user.mfaMethod,
            mfaPhoneNumber: user.mfaPhoneNumber?.slice(-4),
          },
        };
        return;
      }

      const { token, payload } = createAuthToken(user);
      user.addAuthToken(payload, ctx);
      await user.save();

      await AuditEntry.append('Successfully authenticated', ctx, {
        object: user,
        user: user.id,
      });

      ctx.body = {
        data: { token: token },
      };
    }
  )
  .post(
    '/confirm-access',
    validateBody({
      password: Joi.string(),
    }),
    authenticate({ type: 'user' }),
    fetchUser,
    async (ctx) => {
      const { authUser } = ctx.state;
      const { password } = ctx.request.body;

      try {
        await verifyLoginAttempts(authUser);
      } catch (error) {
        await AuditEntry.append('Reached max authentication attempts', ctx, {
          category: 'security',
          object: authUser,
          user: authUser.id,
        });
        ctx.throw(401, error);
      }

      try {
        await verifyPassword(authUser, password);
      } catch (error) {
        await AuditEntry.append('Failed authentication (confirm-access)', ctx, {
          category: 'security',
          object: authUser,
          user: authUser.id,
        });
        ctx.throw(401, error);
      }

      await AuditEntry.append('Successfully authenticated (confirm-access)', ctx, {
        object: authUser,
        user: authUser.id,
      });

      authUser.accessConfirmedAt = new Date();
      await authUser.save();
      ctx.status = 204;
    }
  )
  .post(
    '/logout',
    validateBody({
      all: Joi.boolean(),
      jti: Joi.string(),
    }),
    authenticate({ type: 'user' }),
    fetchUser,
    async (ctx) => {
      const user = ctx.state.authUser;
      const { body } = ctx.request;
      const jti = body.jti || ctx.state.jwt.jti;
      if (body.all) {
        user.authTokens = [];
      } else if (jti) {
        user.authTokens = user.authTokens.filter((token) => token.jti !== jti);
      }
      await user.save();

      await AuditEntry.append('Deauthentication', ctx, {
        object: user,
        user: user.id,
      });

      ctx.status = 204;
    }
  )
  .post(
    '/accept-invite',
    validateBody({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      password: passwordField.required(),
    }),
    authenticate({ type: 'invite' }),
    async (ctx) => {
      const { firstName, lastName, password } = ctx.request.body;
      const invite = await Invite.findByIdAndUpdate(ctx.state.jwt.inviteId, {
        $set: { status: 'accepted' },
      });
      if (!invite) {
        return ctx.throw(400, 'Invite could not be found');
      }

      const existingUser = await User.findOne({ email: invite.email });

      if (existingUser) {
        const { token, payload } = createAuthToken(existingUser);
        existingUser.addAuthToken(payload, ctx);
        await existingUser.save();
        ctx.body = {
          data: { token },
        };
        return;
      }

      const user = new User({
        firstName,
        lastName,
        email: invite.email,
        password,
      });
      const { token, payload } = createAuthToken(user);
      user.addAuthToken(payload, ctx);
      await user.save();

      await AuditEntry.append('Registered', ctx, {
        object: user,
        user: user.id,
      });

      ctx.body = {
        data: { token },
      };
    }
  )
  .post(
    '/request-password',
    validateBody({
      email: Joi.string().email().required(),
    }),
    async (ctx) => {
      const { email } = ctx.request.body;
      const user = await User.findOne({ email });
      if (!user) {
        ctx.throw(400, 'Unknown email address.');
      }

      const tokenId = generateTokenId();
      const token = createTemporaryToken({ type: 'password', sub: user.id, jti: tokenId });
      await user.updateOne({ tempTokenId: tokenId });

      await sendTemplatedMail({
        user,
        email,
        token,
        file: 'reset-password.md',
      });

      ctx.status = 204;
    }
  )
  .post(
    '/set-password',
    validateBody({
      password: passwordField.required(),
    }),
    authenticate({ type: 'password' }),
    async (ctx) => {
      const { jwt } = ctx.state;
      const { password } = ctx.request.body;
      const user = await User.findById(jwt.sub);
      if (!user) {
        ctx.throw(400, 'User does not exist');
      } else if (user.tempTokenId !== jwt.jti) {
        await AuditEntry.append('Attempted reset password', ctx, {
          category: 'security',
          object: user,
          user: user.id,
        });
        ctx.throw(400, 'Token is invalid (jti)');
      }

      user.loginAttempts = 0;
      user.password = password;
      user.tempTokenId = undefined;
      const { token, payload } = createAuthToken(user);

      user.addAuthToken(payload, ctx);
      await user.save();

      await AuditEntry.append('Reset password', ctx, {
        object: user,
        user: user.id,
      });

      ctx.body = {
        data: { token },
      };
    }
  );

module.exports = router;
