import appSession from './AppSession';
import Auth from './Auth';
import Me from './Me';
import Users from './Users';
import Products from './Products';
import Shops from './Shops';
import Invites from './Invites';

export default {
  appSession,
  auth: new Auth(),
  me: new Me(),
  products: new Products(),
  shops: new Shops(),
  users: new Users(),
  invites: new Invites()
};
