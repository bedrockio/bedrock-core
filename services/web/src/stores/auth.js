import BaseStore from './BaseStore';
import { request } from 'utils/api';
import { omit } from 'lodash';

import session from 'stores/session';

class Auth extends BaseStore {

  async setPassword(body) {
    const { data } = await request({
      method: 'POST',
      path: '/1/auth/set-password',
      body
    });
    session.setToken(data.token);
  }

  async login(body) {
    const { data } = await request({
      method: 'POST',
      path: '/1/auth/login',
      body,
    });
    session.setToken(data.token);
  }

  async acceptInvite(body) {
    const { data } = await request({
      method: 'POST',
      path: '/1/auth/accept-invite',
      body: omit(body, ['acceptTerms', 'email'])
    });
    session.setToken(data.token);
  }

  async register(body) {
    const { data } = await request({
      method: 'POST',
      path: '/1/auth/register',
      body
    });
    session.setToken(data.token);
  }
}

export default new Auth();
