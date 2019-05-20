export default (user = null, action) => {
  switch (action.type) {
    case 'logIn':
      return action.user;
    case 'logOut':
      return null;
    default:
      return user;
  }
};
