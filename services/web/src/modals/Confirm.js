import { Button } from '@mantine/core';
import React, { useState } from 'react';

import ErrorMessage from 'components/ErrorMessage';
import ModalWrapper, { useModalContext } from 'components/ModalWrapper';
import Actions from 'components/form-fields/Actions';

/**
 * Confirm dialog component using Mantine Modal.
 *
 * @param {object} props
 * @param {React.ReactNode} props.title - Title.
 * @param {React.ReactNode} props.content - Content.
 * @param {string} [props.confirmButton] - Confirm button label.
 * @param {boolean} [props.negative] - If true, confirm button is red.
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
        <Button variant="default" onClick={close} disabled={loading}>
          Cancel
        </Button>
        <Button color={negative && 'red'} loading={loading} onClick={onConfirm}>
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
