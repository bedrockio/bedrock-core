import { useDisclosure } from '@mantine/hooks';
import { Modal, useModalsStack } from '@mantine/core';
import { cloneElement, isValidElement } from 'react';

export function ModalTrigger({ trigger, children, title }) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      {isValidElement(trigger)
        ? cloneElement(trigger, { onClick: open })
        : trigger}

      <Modal opened={opened} onClose={close} title={title} centered>
        {children}
      </Modal>
    </>
  );
}
