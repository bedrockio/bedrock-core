const Router = require('@koa/router');
const auth = require('./auth');
const mfa = require('./mfa');
const users = require('./users');
const products = require('./products');
const shops = require('./shops');
const uploads = require('./uploads');
const invites = require('./invites');
const status = require('./status');
const auditEntries = require('./audit-entries');
const categories = require('./categories');
const organizations = require('./organizations');
const applications = require('./applications');

const router = new Router();

router.use('/auth', auth.routes());
router.use('/mfa', mfa.routes());
router.use('/audit-entries', auditEntries.routes());
router.use('/users', users.routes());
router.use('/products', products.routes());
router.use('/shops', shops.routes());
router.use('/uploads', uploads.routes());
router.use('/invites', invites.routes());
router.use('/status', status.routes());
router.use('/categories', categories.routes());
router.use('/organizations', organizations.routes());
router.use('/applications', applications.routes());

module.exports = router;
