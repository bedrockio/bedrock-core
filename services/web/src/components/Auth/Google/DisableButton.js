import { Button } from '@mantine/core';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import { useState } from 'react';

import { useSession } from 'stores/session';

import { disable } from 'utils/auth/google';

/**
 * Button to disable Google authentication for the current user.
 * @param {object} props - Component props.
 * @param {Function} [props.onError=noop] - Callback function for errors.
 * @param {Function} [props.onDisabled=noop] - Callback function after successful disabling.
 * @param {object} rest - Remaining props to pass to the Mantine Button.
 * @returns {JSX.Element}
 */
export default function DisableButton({
  onError = noop,
  onDisabled = noop,
  ...rest
}) {
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useSession();

  async function handleClick() {
    if (!user) {
      onError(new Error('User not found in context.'));
      return;
    }
    try {
      setLoading(true);
      const updatedUser = await disable(user);
      setLoading(false);
      updateUser(updatedUser);
      onDisabled();
    } catch (error) {
      setLoading(false);
      onError(error);
    }
  }

  return (
    <Button
      color="red"
      size="sm"
      loading={loading}
      onClick={handleClick}
      {...rest} // Spread remaining props
    >
      Disable
    </Button>
  );
}

DisableButton.propTypes = {
  onError: PropTypes.func,
  onDisabled: PropTypes.func,
};
