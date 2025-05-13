import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import { cloneElement, isValidElement, createContext, useContext } from 'react';

// Create a context for the modal
const ModalContext = createContext({
  close: () => {},
});

// Hook for components to use within the modal
export function useModalContext() {
  return useContext(ModalContext);
}

export default function ModalWrapper({
  trigger,
  component,
  children,
  title,
  size = 'md',
  onClose,
  ...otherProps
}) {
  const [opened, { open, close }] = useDisclosure(false);

  function handleClose() {
    close();
    if (onClose) onClose();
  }

  function renderTrigger() {
    if (isValidElement(trigger)) {
      return cloneElement(trigger, {
        onClick: (e) => {
          trigger.props.onClick?.(e);
          open();
        },
      });
    }
    return null;
  }

  return (
    <>
      {renderTrigger()}
      <Modal
        opened={opened}
        onClose={handleClose}
        title={title}
        centered
        size={size}
        {...otherProps}>
        <ModalContext.Provider value={{ close: handleClose }}>
          {component ? component : children}
        </ModalContext.Provider>
      </Modal>
    </>
  );
}
