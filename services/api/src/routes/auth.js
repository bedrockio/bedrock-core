const Router = require('@koa/router');
const Joi = require('@hapi/joi');
const config = require('@bedrockio/config');
const validate = require('../utils/middleware/validate');
const { authenticate } = require('../utils/middleware/authenticate');
const tokens = require('../utils/tokens');
const { sendWelcome, sendResetPassword, sendResetPasswordUnknown } = require('../utils/emails');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');
const { User, Invite } = require('../models');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(
  config.get('GOOGLE_OAUTH_CLIENT_ID'),
  config.get('GOOGLE_OAUTH_CLIENT_SECRET'),
  config.get('GOOGLE_OAUTH_CLIENT_REDIRECT_URI'),
);

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
      const user = await User.findOne({ email });
      if (!user) {
        throw new UnauthorizedError('email password combination does not match');
      }
      const isSame = await user.verifyPassword(password);
      if (!isSame) {
        throw new UnauthorizedError('email password combination does not match');
      }
      ctx.body = { data: { token: tokens.createUserToken(user) } };
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
        await sendResetPassword({
          to: email,
          token: tokens.createUserTemporaryToken({ userId: user.id }, 'password'),
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
      const { password } = ctx.request.body;
      const user = await User.findById(ctx.state.jwt.userId);
      if (!user) {
        ctx.throw(500, 'user does not exist');
      }
      user.password = password;
      await user.save();
      ctx.body = { data: { token: tokens.createUserToken(user) } };
    }
  )
  .get('/google', async (ctx) => {
    const { code, state, redirect_uri: redirectUri } = ctx.request.query;
    if (code) {
      const { tokens: authTokens } = await googleClient.getToken(code);
      const { email } = await googleClient.getTokenInfo(authTokens.access_token);
      // TODO: create user? profile name?
      const user = await User.findOne({
        email,
        deletedAt: {
          $exists: false
        }
      });
      const { redirectUri } = JSON.parse(Buffer.from(state, 'base64').toString());
      const token = tokens.createUserToken(user);
      if (redirectUri) {
        const url = new URL(redirectUri);
        url.searchParams.append('token', token);
        ctx.redirect(url);
      } else {
        ctx.body = {
          data: {
            token,
          }
        };
      }
    } else {
      let state;
      if (redirectUri) {
        state = JSON.stringify({
          redirectUri,
        });
        state = Buffer.from(state).toString('base64');
      }
      const authUrl = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: 'openid profile email',
        state,
      });
      ctx.redirect(authUrl);
    }
  });

module.exports = router;
