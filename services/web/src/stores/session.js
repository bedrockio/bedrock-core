import BaseStore from './BaseStore';

class Session extends BaseStore {

  token = localStorage.getItem('jwt');

  setToken(token) {
    if (token) {
      localStorage.setItem('jwt', token);
    } else {
      localStorage.removeItem('jwt');
    }
    this.token = token;
    this.notify();
  }

}

export default new Session();
