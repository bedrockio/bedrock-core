import { useState } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import { Button } from '@mantine/core'; // Import Mantine Button

import { useSession } from 'stores/session'; // Assuming SessionContext is exported

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

  /**
   * Handles the button click event to disable Google auth.
   */
  async function handleClick() {
    // Use user from context directly
    if (!user) {
      onError(new Error('User not found in context.'));
      return;
    }
    try {
      setLoading(true);
      const updatedUser = await disable(user); // Use updatedUser variable name
      setLoading(false);
      updateUser(updatedUser); // Use updateUser from context
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
