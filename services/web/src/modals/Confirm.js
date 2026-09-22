import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import ErrorMessage from 'components/ErrorMessage';
import ModalWrapper, { useModalContext } from 'components/ModalWrapper';
import Actions from 'components/form-fields/Actions';

/**
 * Confirm dialog component using shadcn Dialog.
 *
 * @param {object} props
 * @param {React.ReactNode} props.title - Title.
 * @param {React.ReactNode} props.content - Content.
 * @param {string} [props.confirmButton] - Confirm button label.
 * @param {boolean} [props.negative] - If true, confirm button is destructive.
 * @param {function} [props.onConfirm] - Async function called on confirm.
 * @returns {JSX.Element}
 */
function Confirm(props) {
  const {
    content,
    negative = false,
    confirmButton = 'OK',
    onConfirm: handler,
  } = props;

  const { close } = useModalContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function onConfirm() {
    setLoading(true);
    setError(null);
    try {
      await handler();
      setLoading(false);
      close();
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  }

  return (
    <React.Fragment>
      <ErrorMessage error={error} />
      {content}
      <Actions>
        <Button variant="outline" onClick={close} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={negative ? 'destructive' : 'default'}
          disabled={loading}
          onClick={onConfirm}>
          {loading && <Spinner />}
          {confirmButton}
        </Button>
      </Actions>
    </React.Fragment>
  );
}

function Wrapper(props) {
  const { title, trigger, ...rest } = props;
  return (
    <ModalWrapper title={title} trigger={trigger}>
      <Confirm {...rest} />
    </ModalWrapper>
  );
}
export default Wrapper;
