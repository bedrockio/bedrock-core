import { Alert, Button } from '@mantine/core';
import PropTypes from 'prop-types';

import BasicLayout from 'layouts/Basic';
import { useSession } from 'stores/session';

import Meta from 'components/Meta';

import { ENV_NAME } from 'utils/env';

function ErrorScreen({ title = 'Something went wrong', error }) {
  const { logout } = useSession();

  const handleLogoutClick = async () => {
    await logout();
  };

  const handleReloadClick = () => {
    window.location.reload();
  };

  const renderReloadLink = (text) => {
    return (
      <span className="link" onClick={handleReloadClick}>
        {text}
      </span>
    );
  };

  const renderErrorBody = () => {
    if (ENV_NAME === 'production') {
      if (error.status >= 500) {
        return (
          <p>
            Our site seems to be having issues. Please wait a bit and{' '}
            {renderReloadLink('reload')} the page.
          </p>
        );
      } else {
        return (
          <p>We're looking into the issue. {renderReloadLink('reload')}</p>
        );
      }
    } else {
      return error.message;
    }
  };

  return (
    <BasicLayout>
      <Meta title={title || 'Error'} />
      <Alert color="red" title={title}>
        {renderErrorBody()}
      </Alert>
      <div>
        <Button size="xs" onClick={handleLogoutClick}>
          Logout
        </Button>
      </div>
    </BasicLayout>
  );
}

ErrorScreen.propTypes = {
  error: PropTypes.object.isRequired,
};

export default ErrorScreen;
