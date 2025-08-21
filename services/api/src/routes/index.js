const Router = require('@koa/router');

const meta = require('./meta');
const docs = require('./docs');
const auth = require('./auth');
const users = require('./users');
const products = require('./products');
const shops = require('./shops');
const uploads = require('./uploads');
const invites = require('./invites');
const status = require('./status');
const signup = require('./signup');
const templates = require('./templates');
const categories = require('./categories');
const auditEntries = require('./audit-entries');
const organizations = require('./organizations');
const applications = require('./applications');

const router = new Router({
  prefix: '/1',
});

router.use('/meta', meta.routes());
router.use('/docs', docs.routes());
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
router.use('/audit-entries', auditEntries.routes());
router.use('/organizations', organizations.routes());
router.use('/applications', applications.routes());

module.exports = router.routes();
