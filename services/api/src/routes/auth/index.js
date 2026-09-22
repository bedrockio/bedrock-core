import Router from '@koa/router';

import otp from './otp.js';
import totp from './totp.js';
import apple from './apple.js';
import google from './google.js';
import passkey from './passkey.js';
import password from './password.js';
import other from './other.js';

const router = new Router();

router.use('/otp', otp.routes());
router.use('/totp', totp.routes());
router.use('/apple', apple.routes());
router.use('/google', google.routes());
router.use('/passkey', passkey.routes());
router.use('/password', password.routes());
router.use(other.routes());

export default router;
