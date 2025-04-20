import { useState, useCallback } from 'react';
import { Button, Group, Stack } from '@mantine/core';
import PropTypes from 'prop-types';
import ErrorMessage from './ErrorMessage';
import { modals } from '@mantine/modals';

/**
 * Confirm dialog component using Mantine Modal.
 *
 * @param {object} props
 * @param {React.ReactNode} props.content - Content.
 * @param {string} [props.confirmButton] - Confirm button label.
 * @param {boolean} [props.negative] - If true, confirm button is red.
 * @param {function} [props.onConfirm] - Async function called on confirm.
 * @param {function} props.close - Function to close the modal.
 * @returns {JSX.Element}
 */
export default function ConfirmModal(props) {
  const {
    content,
    confirmButton = 'OK',
    negative = false,
    onConfirm = () => {},
    onClose = () => {
      modals.closeAll();
    },
  } = props;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(() => {
        onClose();
      });
      if (!closed) {
        setLoading(false);
        onClose();
      }
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  }, [onConfirm, onClose]);

  return (
    <Stack>
      <Stack gap="md">
        {content}
        {error && <ErrorMessage error={error} />}
      </Stack>

      <Group justify="flex-end">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          color={negative && 'red'}
          loading={loading}
          onClick={handleConfirm}>
          {confirmButton || 'Confirm'}
        </Button>
      </Group>
    </Stack>
  );
}

ConfirmModal.propTypes = {
  content: PropTypes.node,
  confirmButton: PropTypes.string,
  negative: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};
