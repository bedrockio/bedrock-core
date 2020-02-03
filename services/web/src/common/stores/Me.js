import { observable, action } from 'mobx';
import BaseStore from './BaseStore';
import { request } from 'utils/api';

export default class MeStore extends BaseStore {
  @observable user;

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
