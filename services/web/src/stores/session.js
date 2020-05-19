class Session {

  token = localStorage.getItem('jwt');
  user = null;

  setToken(token) {
    if (token) {
      localStorage.setItem('jwt', token);
    } else {
      localStorage.removeItem('jwt');
    }
    this.token = token;
  }

  setUser(user) {
    this.user = user;
  }

  isAdmin() {
    return this.hasRole('admin');
  }

  hasRole(role) {
    return this.user?.roles.includes(role);
  }

}

export default new Session();
