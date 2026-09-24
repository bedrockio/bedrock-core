import Router from '@koa/router';
import config from '@bedrockio/config';

import meta from './meta.js';
import docs from './docs.js';
import auth from './auth/index.js';
import users from './users.js';
import products from './products.js';
import shops from './shops.js';
import uploads from './uploads.js';
import invites from './invites.js';
import status from './status.js';
import signup from './signup.js';
import templates from './templates.js';
import categories from './categories.js';
import unsubscribe from './unsubscribe.js';
import auditEntries from './audit-entries.js';
import organizations from './organizations.js';

const router = new Router({
  prefix: '/1',
});

router.use('/meta', meta.routes());

// Docs editing writes to openapi.json on disk and is unauthenticated.
if (config.get('ENV_NAME') === 'development') {
  router.use('/docs', docs.routes());
}

router.use('/auth', auth.routes());
router.use('/users', users.routes());
router.use('/products', products.routes());
router.use('/shops', shops.routes());
router.use('/uploads', uploads.routes());
router.use('/invites', invites.routes());
router.use('/status', status.routes());
router.use('/signup', signup.routes());
router.use('/templates', templates.routes());
router.use('/categories', categories.routes());
router.use('/unsubscribe', unsubscribe.routes());
router.use('/audit-entries', auditEntries.routes());
router.use('/organizations', organizations.routes());

export default router.routes();
