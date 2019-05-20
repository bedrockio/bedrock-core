const Router = require('koa-router');
const Joi = require('joi');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authenticate');
const tokens = require('../lib/tokens');
const { sendWelcome, sendResetPassword, sendResetPasswordUnknown } = require('../lib/emails');
const User = require('../models/user');
const Invite = require('../models/invite');

const router = new Router();

const passwordField = Joi.string()
  .min(6)
  .options({
    language: {
      string: {
        regex: {
          base: 'Your password must be at least 6 characters long. Please try another.'
        }
      }
    }
  });

router
  .post(
    '/register',
    validate({
      body: {
        email: Joi.string()
          .lowercase()
          .email()
          .required(),
        name: Joi.string().required(),
        password: passwordField.required()
      }
    }),
    async (ctx) => {
      const { email, name } = ctx.request.body;
      const existingUser = await User.findOne({ email, deletedAt: { $exists: false } });
      if (existingUser) {
        ctx.throw(400, 'A user with that email already exists');
      }

      const user = await User.create({
        ...ctx.request.body,
        roles: ['user']
      });

      await sendWelcome({
        name,
        to: email
      });

      ctx.body = { data: { token: tokens.createUserToken(user) } };
    }
  )
  .post(
    '/login',
    validate({
      body: {
        email: Joi.string()
          .email()
          .required(),
        password: Joi.string().required()
      }
    }),
    async (ctx) => {
      const { email, password } = ctx.request.body;
      const user = await User.findOne({ email });
      if (!user) {
        ctx.throw(401, 'email password combination does not match');
      }
      const isSame = await user.verifyPassword(password);
      if (!isSame) {
        ctx.throw(401, 'email password combination does not match');
      }
      ctx.body = { data: { token: tokens.createUserToken(user) } };
    }
  )
  .post(
    '/accept-invite',
    validate({
      body: {
        token: Joi.string(),
        name: Joi.string().required(),
        password: passwordField.required()
      }
    }),
    authenticate({ type: 'invite' }, { getToken: (ctx) => ctx.request.body.token }),
    async (ctx) => {
      const { name, password } = ctx.request.body;
      const invite = await Invite.findByIdAndUpdate(ctx.state.jwt.inviteId, {
        $set: { status: 'accepted' }
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
        password
      });

      ctx.body = { data: { token: tokens.createUserToken(user) } };
    }
  )
  .post(
    '/request-password',
    validate({
      body: {
        email: Joi.string()
          .email()
          .required()
      }
    }),
    async (ctx) => {
      const { email } = ctx.request.body;
      const user = await User.findOne({ email });
      if (user) {
        await sendResetPassword({
          to: email,
          token: tokens.createUserTemporaryToken({ userId: user.id }, 'password')
        });
      } else {
        await sendResetPasswordUnknown({
          to: email
        });
      }
      ctx.status = 204;
    }
  )
  .post(
    '/set-password',
    validate({
      body: {
        token: Joi.string().required(),
        password: passwordField.required()
      }
    }),
    authenticate({ type: 'password' }, { getToken: (ctx) => ctx.request.body.token }),
    async (ctx) => {
      const { password } = ctx.request.body;
      const user = await User.findById(ctx.state.jwt.userId);
      if (!user) {
        ctx.throw(500, 'user does not exists');
      }
      user.password = password;
      await user.save();
      ctx.body = { data: { token: tokens.createUserToken(user) } };
    }
  );

module.exports = router;
