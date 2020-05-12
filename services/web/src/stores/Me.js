import { observable, action } from 'mobx';
import { request } from 'utils/api';
import BaseStore from './BaseStore';

export default class MeStore extends BaseStore {
  @observable user;

  isAdmin() {
    return this.hasRole('admin');
  }

  hasRole(role) {
    return this.user?.roles.includes(role);
  }

  @action
  fetch(statusKey) {
    const status = this.createStatus(statusKey);
    return request({
      method: 'GET',
      path: '/1/users/me'
    })
      .then((resp) => {
        this.user = resp.data;
        status.success();
      })
      .catch((err) => {
        status.error(err);
        return err;
      });
  }
}
