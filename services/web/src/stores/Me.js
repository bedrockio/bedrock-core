//import { observable, action } from 'mobx';
//import BaseStore from './BaseStore';
//import request from 'utils/request';
import request from 'utils/request';
import { BaseStore, action } from 'utils/store';

export default class MeStore extends BaseStore {

  get user() {
    return this.item;
  }

  @action
  async fetch(statusKey) {
    return await request({
      method: 'GET',
      path: '/1/users/me'
    })
  }
}
