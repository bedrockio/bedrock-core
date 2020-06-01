const Router = require('koa-router');
const auth = require('./auth');
const users = require('./users');
const products = require('./products');
const shops = require('./shops');
const uploads = require('./uploads');
const invites = require('./invites');
const categories = require('./categories');
const status = require('./status');

const router = new Router();

router.use('/auth', auth.routes());
router.use('/users', users.routes());
router.use('/products', products.routes());
router.use('/shops', shops.routes());
router.use('/uploads', uploads.routes());
router.use('/invites', invites.routes());
router.use('/categories', categories.routes());
router.use('/status', status.routes());

module.exports = router;
