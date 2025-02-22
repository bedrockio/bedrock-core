import React from 'react';
import PropTypes from 'prop-types';
import { Message, Button } from 'semantic';

import { useSession } from 'contexts/session';

import BasicLayout from 'layouts/Basic';

import { ENV_NAME } from 'utils/env';

const ErrorScreen = ({ title, error }) => {
  const { logout } = useSession();

  const onLogoutClick = async () => {
    await logout(true);
  };

  const onReloadClick = () => {
    window.location.reload();
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

  const renderReloadLink = (text) => {
    return (
      <span className="link" onClick={onReloadClick}>
        {text}
      </span>
    );
  };

  return (
    <BasicLayout>
      <Message error header={title} content={renderErrorBody()} />
      <div>
        <Button size="small" onClick={onLogoutClick} primary>
          Logout
        </Button>
      </div>
    </BasicLayout>
  );
};

ErrorScreen.propTypes = {
  title: PropTypes.string.isRequired,
  error: PropTypes.object.isRequired,
};

ErrorScreen.defaultProps = {
  title: 'Something went wrong',
};

export default ErrorScreen;
