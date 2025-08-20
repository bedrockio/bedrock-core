import { useState, useEffect, useRef } from 'react';
import { Button, Popover, Alert } from '@mantine/core';
import { PiWarningCircleFill } from 'react-icons/pi';

/**
 * A button that displays a loading indicator during an async onClick operation
 * and shows an error message in a popover if the operation fails.
 *
 * @param {object} props - Component props.
 * @param {Function} props.onClick - The asynchronous function to call when the button is clicked.
 * @param {React.ReactNode} props.children - The content of the button.
 * @param {object} otherProps - Other props to pass down to the Mantine Button component.
 * @returns {React.ReactElement} The LoadButton component.
 */
export default function LoadButton({ onClick, children, ...otherProps }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function handleClick(event) {
    setLoading(true);
    setError(null);
    setPopoverOpened(false);

    try {
      await onClick(event);
      if (mounted.current) {
        setLoading(false);
      }
    } catch (e) {
      if (mounted.current) {
        setLoading(false);
        setError(e);
        setPopoverOpened(true);
      }
    }
  }

  function handlePopoverClose() {
    setPopoverOpened(false);
    // Optionally reset error after a delay or when popover closes
    // setTimeout(() => setError(null), 300);
  }

  return (
    <Popover
      opened={popoverOpened && !!error}
      onClose={handlePopoverClose}
      position="bottom"
      withArrow
      shadow="md"
      trapFocus={false} // Allow interaction outside the popover
      withinPortal // Render popover in portal
    >
      <Popover.Target>
        <Button
          loading={loading}
          onClick={handleClick}
          color={error ? 'red' : otherProps.color}
          {...otherProps}>
          {children}
        </Button>
      </Popover.Target>
      <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
        {error && (
          <Alert
            icon={<PiWarningCircleFill />}
            title="Error"
            color="red"
            withCloseButton={false} // Popover handles closing
            onClick={handlePopoverClose} // Allow clicking alert to close
            sx={{ cursor: 'pointer' }}>
            {error.message || 'An unexpected error occurred.'}
          </Alert>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
