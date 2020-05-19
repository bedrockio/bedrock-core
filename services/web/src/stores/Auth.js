import { action } from 'mobx';
import BaseStore from './BaseStore';
import { request } from 'utils/api';
import { omit } from 'lodash';

import appSession from 'stores/AppSession';

export default class AuthStore extends BaseStore {
  @action
  setPassword(body, statusKey) {
    const status = this.createStatus(statusKey);
    return request({
      method: 'POST',
      path: '/1/auth/set-password',
      body,
    })
      .then(resp => {
        appSession.reset();
        appSession.setToken(resp.data.token);
        status.success();
      })
      .catch(err => {
        status.error(err);
        return err;
      });
  }

  login(body, statusKey) {
    const status = this.createStatus(statusKey);
    return request({
      method: 'POST',
      path: '/1/auth/login',
      body: body,
    })
      .then(resp => {
        appSession.reset();
        appSession.setToken(resp.data.token);
        status.success();
      })
      .catch(err => {
        status.error(err);
        return err;
      });
  }

  @action
  acceptInvite(body, statusKey) {
    return new Promise((resolve, reject) => {
      const status = this.createStatus(statusKey);

      request({
        method: 'POST',
        path: '/1/auth/accept-invite',
        body: omit(body, ['acceptTerms', 'email']),
      })
        .then(resp => {
          appSession.reset();
          appSession.setToken(resp.data.token);
          status.success();
          resolve();
        })
        .catch(err => {
          status.error(err);
          reject(err);
        });
    });
  }

  @action
  register(body, statusKey) {
    return new Promise((resolve, reject) => {
      const status = this.createStatus(statusKey);

      request({
        method: 'POST',
        path: '/1/auth/register',
        body,
      })
        .then(resp => {
          appSession.reset();
          appSession.setToken(resp.data.token);
          status.success();
          resolve();
        })
        .catch(err => {
          status.error(err);
          reject(err);
        });
    });
  }
}
