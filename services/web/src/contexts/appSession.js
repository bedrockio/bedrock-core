import React from 'react';

export const AppSession = React.createContext();

export const useAppSession = () => {
  const context = React.useContext(AppSession);
  if (context === undefined) {
    throw new Error('useAppSession must be used within a AppSession Context');
  }
  return context;
};

const AppSessionProvider = ({ children }) => {
  const [token, setToken] = React.useState(window.localStorage.getItem('token') || null);
  const [loaded, setLoaded] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [isUserAdmin, setIsAdmin] = React.useState(false);

  function reset() {
    setToken(null);
    setLoaded(false);
    setUser(null);
    window.localStorage.clear();
  }

  React.useEffect(() => {
    setIsAdmin(user?.roles.includes('admin'));
  }, [user]);

  React.useEffect(() => {
    if (token) {
      window.localStorage.setItem('token', token);
    } else {
      window.localStorage.removeItem('token');
    }
    setToken(token);
  }, [token]);

  return (
    <AppSession.Provider
      value={{
        isUserAdmin,
        setToken,
        token,
        setLoaded,
        loaded,
        setUser,
        user,
        reset,
      }}>
      {children}
    </AppSession.Provider>
  );
};

export default AppSessionProvider;
