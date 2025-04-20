import { useState } from 'react';
import PropTypes from 'prop-types';
import { omit, noop } from 'lodash';
import { Button } from '@mantine/core'; // Import Mantine Button

import { useSession } from 'stores/session'; // Import useSession hook

import { disable } from 'utils/auth/apple';

/**
 * Button component for disabling Apple authentication.
 * @param {object} props Component props.
 * @param {function} [props.onError=noop] Callback function for errors.
 * @param {function} [props.onDisabled=noop] Callback function after successful disabling.
 * @returns {JSX.Element} The DisableButton component.
 */
export default function DisableButton(props) {
  const { onError = noop, onDisabled = noop, ...restProps } = props;
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useSession(); // Use the hook to get session context

  /**
   * Handles the button click event to initiate the disable process.
   */
  async function handleClick() {
    try {
      setLoading(true);
      const updatedUser = await disable(user);
      updateUser(updatedUser); // Update user in session state
      setLoading(false);
      onDisabled();
    } catch (error) {
      setLoading(false);
      onError(error);
    }
  }

  // Omit internal props before spreading onto the Mantine Button
  const buttonProps = omit(restProps, Object.keys(DisableButton.propTypes));

  return (
    <Button
      color="red"
      size="sm"
      loading={loading}
      onClick={handleClick}
      {...buttonProps} // Spread remaining props
    >
      Disable
    </Button>
  );
}

DisableButton.propTypes = {
  onError: PropTypes.func,
  onDisabled: PropTypes.func,
};
