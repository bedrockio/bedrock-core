import { request } from 'utils/api';
import BaseStore from './BaseStore';

class Me extends BaseStore {

  user = null;

  isAdmin() {
    return this.hasRole('admin');
  }

  hasRole(role) {
    return this.user?.roles.includes(role);
  }

  async fetch() {
    const { data } = await request({
      method: 'GET',
      path: '/1/users/me'
    });
    this.user = data;
    this.notify();
  }
}

export default new Me();
