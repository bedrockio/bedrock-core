import { cloneElement, createContext, isValidElement, useContext, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Create a context for the modal
const ModalContext = createContext({
  close: () => {},
});

// Hook for components to use within the modal
export function useModalContext() {
  return useContext(ModalContext);
}

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function ModalWrapper({
  trigger,
  component,
  children,
  title,
  size = 'md',
  onClose,
}) {
  const [opened, setOpened] = useState(false);

  function open() {
    setOpened(true);
  }

  function close() {
    setOpened(false);
  }

  function handleClose() {
    close();
    if (onClose) onClose();
  }

  function onOpenChange(value) {
    if (value) {
      open();
    } else {
      handleClose();
    }
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
      <Dialog open={opened} onOpenChange={onOpenChange}>
        <DialogContent className={cn(SIZES[size])}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <ModalContext.Provider value={{ close: handleClose }}>
            {component ? component : children}
          </ModalContext.Provider>
        </DialogContent>
      </Dialog>
    </>
  );
}
