import { noop } from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from '@bedrockio/router';
import { ActionIcon } from '@mantine/core';
import { IconFingerprint } from '@tabler/icons-react';

import { withSession } from 'stores/session';

import { login } from 'utils/auth/passkey';

const PasskeyButton = ({
  onAuthStart = noop,
  onAuthStop = noop,
  onAuthError = noop,
  history,
  session,
}) => {
  const handleClick = async () => {
    try {
      onAuthStart();
      const result = await login();

      if (result) {
        const next = await session.authenticate(result.token);
        onAuthStop();
        history.push(next);
      } else {
        onAuthStop();
      }
    } catch (error) {
      onAuthError(error);
    }
  };

  return (
    <ActionIcon
      variant="default"
      radius="xl"
      size={42}
      title="Use passkey to sign in."
      onClick={handleClick}>
      <IconFingerprint />
    </ActionIcon>
  );
};

PasskeyButton.propTypes = {
  onAuthStart: PropTypes.func,
  onAuthStop: PropTypes.func,
  onAuthError: PropTypes.func,
  history: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

export default withRouter(withSession(PasskeyButton));
