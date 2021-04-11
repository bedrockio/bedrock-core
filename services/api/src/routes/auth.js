const Router = require('@koa/router');
const Joi = require('joi');
const validate = require('../utils/middleware/validate');
const { authenticate } = require('../utils/middleware/authenticate');
const tokens = require('../utils/tokens');
const { sendWelcome, sendResetPassword, sendResetPasswordUnknown } = require('../utils/emails');
const { BadRequestError } = require('../utils/errors');
const { User, Invite } = require('../models');

const router = new Router();

const passwordField = Joi.string()
  .min(6)
  .message('Your password must be at least 6 characters long. Please try another.');

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

      const user = await User.create({
        ...ctx.request.body,
      });

      await sendWelcome({
        name,
        to: email,
      });

      ctx.body = { data: { token: tokens.createUserToken(user) } };
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
      if (user) {
        try {
          user.verifyLoginAttempts();
          await user.verifyPassword(password);
          await user.updateOne({ loginAttempts: 0 });
          ctx.body = { data: { token: tokens.createUserToken(user) } };
        } catch (err) {
          ctx.throw(401, err.message);
        }
      } else {
        ctx.throw(401, 'Incorrect password');
      }
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
      const existingUser = await User.findOne({ email: invite.email });

      if (existingUser) {
        ctx.body = { data: { token: tokens.createUserToken(existingUser) } };
        return;
      }

      const user = await User.create({
        name,
        email: invite.email,
        password,
      });

      ctx.body = { data: { token: tokens.createUserToken(user) } };
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
      if (user) {
        const tokenId = tokens.generateTokenId();
        const token = tokens.createUserTemporaryToken({ userId: user.id, jit: tokenId }, 'password');
        await user.update({ pendingTokenId: tokenId });
        await sendResetPassword({
          to: email,
          token,
        });
      } else {
        await sendResetPasswordUnknown({
          to: email,
        });
      }
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
      const user = await User.findByIdAndUpdate(jwt.userId, {
        $unset: { pendingTokenId: 1 },
      });
      if (!user) {
        ctx.throw(400, 'User does not exist');
      } else if (user.pendingTokenId !== jwt.jit) {
        ctx.throw(400, 'Token is invalid');
      }
      user.password = password;
      await user.save();
      ctx.body = { data: { token: tokens.createUserToken(user) } };
    }
  );

module.exports = router;
