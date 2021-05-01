const Router = require('@koa/router');
const Joi = require('joi');
const validate = require('../utils/middleware/validate');
const { authenticate } = require('../utils/middleware/authenticate');
const { createAuthToken, createTemporaryToken, generateTokenId } = require('../utils/tokens');
const { sendTemplatedMail } = require('../utils/mailer');
const { BadRequestError } = require('../utils/errors');
const { User, Invite } = require('../models');

const router = new Router();

const passwordField = Joi.string()
  .min(12)
  .message('Your password must be at least 12 characters long. Please try another.');

router
  .post(
    '/register',
    validate({
      body: Joi.object({
        email: Joi.string().lowercase().email().required(),
        name: Joi.string().required(),
        password: passwordField.required(),
      }),
    }),
    async (ctx) => {
      const { email, name } = ctx.request.body;
      const existingUser = await User.findOne({ email, deletedAt: { $exists: false } });
      if (existingUser) {
        throw new BadRequestError('A user with that email already exists');
      }

      const authTokenId = generateTokenId();
      const user = await User.create({
        authTokenId,
        ...ctx.request.body,
      });

      await sendTemplatedMail({
        to: [name, email].join(' '),
        template: 'welcome.md',
        subject: 'Welcome to {{appName}}',
        name,
      });

      ctx.body = { data: { token: createAuthToken(user.id, authTokenId) } };
    }
  )
  .post(
    '/login',
    validate({
      body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      }),
    }),
    async (ctx) => {
      const { email, password } = ctx.request.body;
      const user = await User.findOneAndUpdate(
        { email },
        {
          lastLoginAttemptAt: new Date(),
          $inc: { loginAttempts: 1 },
        }
      );

      if (!user) {
        ctx.throw(401, 'Incorrect password');
      }

      if (!user.verifyLoginAttempts()) {
        ctx.throw(401, 'Too many login attempts');
      }

      if (!(await user.verifyPassword(password))) {
        ctx.throw(401, 'Incorrect password');
      }

      const authTokenId = generateTokenId();
      await user.updateOne({ loginAttempts: 0, authTokenId });
      ctx.body = { data: { token: createAuthToken(user.id, authTokenId) } };
    }
  )
  .post(
    '/accept-invite',
    validate({
      body: Joi.object({
        name: Joi.string().required(),
        password: passwordField.required(),
      }),
    }),
    authenticate({ type: 'invite' }),
    async (ctx) => {
      const { name, password } = ctx.request.body;
      const invite = await Invite.findByIdAndUpdate(ctx.state.jwt.inviteId, {
        $set: { status: 'accepted' },
      });
      if (!invite) {
        return ctx.throw(500, 'Invite could not be found');
      }
      const authTokenId = generateTokenId();
      const existingUser = await User.findOne({ email: invite.email });

      if (existingUser) {
        await existingUser.updateOne({ authTokenId });
        ctx.body = { data: { token: createAuthToken(existingUser.id, authTokenId) } };
        return;
      }

      const user = await User.create({
        name,
        email: invite.email,
        password,
        authTokenId,
      });

      ctx.body = { data: { token: createAuthToken(user.id, authTokenId) } };
    }
  )
  .post(
    '/request-password',
    validate({
      body: Joi.object({
        email: Joi.string().email().required(),
      }),
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
        to: [user.name, email].join(' '),
        template: 'reset-password.md',
        subject: 'Password Reset Request',
        token,
        email,
      });

      ctx.status = 204;
    }
  )
  .post(
    '/set-password',
    validate({
      body: Joi.object({
        password: passwordField.required(),
      }),
    }),
    authenticate({ type: 'password' }),
    async (ctx) => {
      const { jwt } = ctx.state;
      const { password } = ctx.request.body;
      const user = await User.findById(jwt.sub);
      if (!user) {
        ctx.throw(400, 'User does not exist');
      } else if (user.tempTokenId !== jwt.jti) {
        ctx.throw(400, 'Token is invalid');
      }
      user.password = password;
      user.tempTokenId = undefined;
      await user.save();
      ctx.body = { data: { token: createAuthToken(user.id) } };
    }
  );

module.exports = router;
