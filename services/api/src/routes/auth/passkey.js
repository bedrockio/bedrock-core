import Router from '@koa/router';
import yd from '@bedrockio/yada';

import { validateBody } from '../../utils/middleware/validate.js';
import { authenticate } from '../../utils/middleware/authenticate.js';
import { expandRoles } from '../../utils/permissions.js';
import documentation from '../../utils/documentation.js';
import { User } from '../../models/index.js';

import { login } from '../../utils/auth/index.js';

import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  authenticatePasskeyResponse,
  registerNewPasskey,
  removePasskey,
} from '../../utils/auth/passkey.js';

const router = new Router();

router
  .post(
    '/generate-login',
    documentation.include(
      documentation.description(
        'Generate Passkey Login',
        'Generates WebAuthn authentication options and a signed challenge token to start a passkey login.',
      ),
      documentation.success(200, {
        description: 'Pass `options` to the WebAuthn API and send `token` back with the response.',
        schema: { data: { token: yd.string(), options: yd.object() } },
        example: {
          data: {
            token: 'eyJhbGciOi...',
            options: { challenge: 'dGVzdC1jaGFsbGVuZ2U', allowCredentials: [], userVerification: 'preferred' },
          },
        },
      }),
    ),
    async (ctx) => {
      try {
        ctx.body = {
          data: await generateAuthenticationOptions(),
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    },
  )
  .post(
    '/verify-login',
    validateBody({
      token: yd.string().required(),
      response: yd.object().required(),
    }),
    documentation.include(
      documentation.description(
        'Verify Passkey Login',
        'Verifies a WebAuthn authentication response against its challenge token and returns an auth token.',
      ),
      documentation.success(200, {
        description: 'Passkey accepted.',
        schema: { data: { token: yd.string() } },
        example: { data: { token: 'eyJhbGciOi...' } },
      }),
    ),
    async (ctx) => {
      const { token, response } = ctx.request.body;

      try {
        const user = await authenticatePasskeyResponse({
          token,
          response,
        });

        ctx.body = {
          data: {
            token: await login(ctx, user),
          },
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    },
  )
  .use(authenticate())
  .post(
    '/generate-new',
    documentation.include(
      documentation.description(
        'Generate Passkey Registration',
        'Generates WebAuthn registration options and a signed challenge token to add a passkey to the authenticated user.',
      ),
      documentation.success(200, {
        description: 'Pass `options` to the WebAuthn API and send `token` back with the response.',
        schema: { data: { token: yd.string(), options: yd.object() } },
        example: {
          data: {
            token: 'eyJhbGciOi...',
            options: {
              challenge: 'dGVzdC1jaGFsbGVuZ2U',
              rp: { id: 'example.com', name: 'Bedrock' },
              user: { name: 'jane@example.com' },
              excludeCredentials: [],
            },
          },
        },
      }),
    ),
    async (ctx) => {
      const { authUser } = ctx.state;

      try {
        const options = await generateRegistrationOptions(authUser);
        await authUser.save();
        ctx.body = {
          data: options,
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    },
  )
  .post(
    '/verify-new',
    validateBody({
      token: yd.string().required(),
      response: yd.object().required(),
    }),
    documentation.include(
      documentation.description(
        'Verify Passkey Registration',
        'Verifies a WebAuthn registration response and adds the passkey to the authenticated user.',
      ),
      documentation.success(200, {
        description: 'Passkey added; returns the updated user.',
        schema: { data: User },
      }),
    ),
    async (ctx) => {
      const { authUser } = ctx.state;
      const { token, response } = ctx.request.body;

      try {
        await registerNewPasskey(authUser, {
          ctx,
          token,
          response,
        });

        ctx.body = {
          data: expandRoles(authUser, ctx),
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    },
  )
  .delete(
    '/:id',
    documentation.include(
      documentation.description('Remove Passkey', 'Removes a passkey from the authenticated user.'),
      documentation.success(200, {
        description: 'Passkey removed; returns the updated user.',
        schema: { data: User },
      }),
    ),
    async (ctx) => {
      const { id } = ctx.params;

      if (!id) {
        ctx.throw(400, 'No id passed.');
      }
      const { authUser } = ctx.state;
      removePasskey(authUser, id);
      await authUser.save();

      ctx.body = {
        data: expandRoles(authUser, ctx),
      };
    },
  );

export default router;
