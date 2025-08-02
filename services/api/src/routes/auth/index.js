const Router = require('@koa/router');

const otp = require('./otp.js');
const totp = require('./totp.js');
const apple = require('./apple.js');
const google = require('./google.js');
const passkey = require('./passkey.js');
const password = require('./password.js');
const other = require('./other.js');

const router = new Router();

router.use('/otp', otp.routes());
router.use('/totp', totp.routes());
router.use('/apple', apple.routes());
router.use('/google', google.routes());
router.use('/passkey', passkey.routes());
router.use('/password', password.routes());
router.use(other.routes());

module.exports = router;
