import Router from '@koa/router';
import auth from './auth';
import users from './users';
import products from './products';
import shops from './shops';
import uploads from './uploads';
import invites from './invites';
import categories from './categories';
import status from './status';

const router = new Router();

router.use('/auth', auth.routes());
router.use('/users', users.routes());
router.use('/products', products.routes());
router.use('/shops', shops.routes());
router.use('/uploads', uploads.routes());
router.use('/invites', invites.routes());
router.use('/categories', categories.routes());
router.use('/status', status.routes());

export default router;
