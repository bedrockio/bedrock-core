import { Button, Group, Stack } from '@mantine/core';
import { useCallback, useState } from 'react';

import { useModalContext } from 'components/ModalWrapper';

import ErrorMessage from '../ErrorMessage';

/**
 * Confirm dialog component using Mantine Modal.
 *
 * @param {object} props
 * @param {React.ReactNode} props.content - Content.
 * @param {string} [props.confirmButton] - Confirm button label.
 * @param {boolean} [props.negative] - If true, confirm button is red.
 * @param {function} [props.onConfirm] - Async function called on confirm.
 * @returns {JSX.Element}
 */
export default function ConfirmModal(props) {
  const {
    content,
    confirmButton = 'OK',
    negative = false,
    onConfirm = () => {},
  } = props;

  const { close } = useModalContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(() => {
        close();
      });
      if (!closed) {
        setLoading(false);
        close();
      }
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  }, [onConfirm, close]);

  return (
    <>
      <Stack>
        <Stack gap="md">
          {content}
          {error && <ErrorMessage error={error} />}
        </Stack>

        <Group justify="flex-end">
          <Button variant="default" onClick={close} disabled={loading}>
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
    </>
  );
}
