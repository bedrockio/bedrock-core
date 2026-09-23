import PropTypes from 'prop-types';

import AuthLogo from 'components/AuthLogo';
import BasicLayout from 'layouts/Basic';
import { useSession } from 'stores/session';

import Meta from 'components/Meta';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
      <AuthLogo />
      <Card className="w-full p-6">
        <Alert variant="destructive">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{renderErrorBody()}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button size="sm" onClick={handleLogoutClick}>
            Logout
          </Button>
        </div>
      </Card>
    </BasicLayout>
  );
}

ErrorScreen.propTypes = {
  error: PropTypes.object.isRequired,
};

export default ErrorScreen;
