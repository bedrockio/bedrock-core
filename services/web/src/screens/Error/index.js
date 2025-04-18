import PropTypes from 'prop-types';
import { Alert, Button } from '@mantine/core';

import { useSession } from 'stores/session';

import Meta from 'components/Meta';
import BasicLayout from 'layouts/Basic';

import { ENV_NAME } from 'utils/env';

function ErrorScreen({ title = 'Something went wrong', error }) {
  const { logout } = useSession();

  const handleLogoutClick = async () => {
    await logout(true);
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
      <Alert color="red" title={title} mb="md">
        {renderErrorBody()}
      </Alert>
      <div>
        <Button size="xs" onClick={handleLogoutClick} color="blue">
          Logout
        </Button>
      </div>
    </BasicLayout>
  );
}

ErrorScreen.propTypes = {
  title: PropTypes.string.isRequired,
  error: PropTypes.object.isRequired,
};

export default ErrorScreen;
