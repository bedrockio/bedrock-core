import { useState } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import { Button } from '@mantine/core';

import { useSession } from 'stores/session';

import { disable } from 'utils/auth/apple';

/**
 * Button component for disabling Apple authentication.
 * @param {object} props Component props.
 * @param {function} [props.onError=noop] Callback function for errors.
 * @param {function} [props.onDisabled=noop] Callback function after successful disabling.
 * @returns {JSX.Element} The DisableButton component.
 */
export default function DisableButton(props) {
  const { onError = noop, onDisabled = noop } = props;
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useSession();

  async function handleClick() {
    try {
      setLoading(true);
      const updatedUser = await disable(user);
      updateUser(updatedUser);
      setLoading(false);
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
      {...props}>
      Disable
    </Button>
  );
}

DisableButton.propTypes = {
  onError: PropTypes.func,
  onDisabled: PropTypes.func,
};
