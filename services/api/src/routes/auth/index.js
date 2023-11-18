const Router = require('@koa/router');

const otp = require('./otp');
const totp = require('./totp');
const apple = require('./apple');
const google = require('./google');
const passkey = require('./passkey');
const password = require('./password');
const other = require('./other');

const router = new Router();

router.use('/otp', otp.routes());
router.use('/totp', totp.routes());
router.use('/apple', apple.routes());
router.use('/google', google.routes());
router.use('/passkey', passkey.routes());
router.use('/password', password.routes());
router.use(other.routes());

module.exports = router;
