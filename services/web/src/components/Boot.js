import React from 'react';
import PageCenter from 'components/PageCenter';
import PageLoader from 'components/PageLoader';
import { Message } from 'semantic-ui-react';
import { useAppSession } from 'contexts/appSession';
import { request } from 'utils/api';
import PropTypes from 'prop-types';
import NotFound from 'components/NotFound';

const Boot = ({ children, admin = false, roles = [] }) => {
  const [error, setError] = React.useState();
  const { token, setLoaded, setUser, loaded, user } = useAppSession();

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await request({
          method: 'GET',
          path: '/1/users/me',
          token: token,
        });
        setUser(data);
        setLoaded(true);
      } catch (e) {
        setError(e);
      }
    }

    if (token) {
      fetchUser();
    } else {
      setLoaded(true);
    }
  }, [token]);

  const hasAccess = React.useMemo(() => {
    if (!user) {
      return false;
    }
    const confirmRoles = admin ? ['admin'] : roles;

    return confirmRoles.every(role => {
      return user?.roles.includes(role);
    });
  }, [user, admin, roles]);

  if (user && !hasAccess) {
    return <NotFound />;
  }

  if (!loaded) {
    return (
      <PageCenter>
        {error && (
          <React.Fragment>
            <Message error header="Something went wrong" content={error.message} />
            <a href="/logout">Logout</a>
          </React.Fragment>
        )}
        {!error && <PageLoader />}
      </PageCenter>
    );
  }

  return children;
};

Boot.propTypes = {
  admin: PropTypes.bool,
  roles: PropTypes.array,
};

export default Boot;
