import { useEffect, useRef, useState } from 'react';
import { PiWarningCircleBold } from 'react-icons/pi';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';

/**
 * A button that displays a loading indicator during an async onClick operation
 * and shows an error message in a popover if the operation fails.
 *
 * @param {object} props - Component props.
 * @param {Function} props.onClick - The asynchronous function to call when the button is clicked.
 * @param {React.ReactNode} props.children - The content of the button.
 * @param {object} otherProps - Other props to pass down to the Button component.
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
      open={popoverOpened && !!error}
      onOpenChange={(open) => {
        if (!open) {
          handlePopoverClose();
        }
      }}>
      <PopoverTrigger asChild>
        <Button
          disabled={loading}
          onClick={handleClick}
          variant={error ? 'destructive' : otherProps.variant}
          {...otherProps}>
          {loading && <Spinner className="text-current" />}
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        onOpenAutoFocus={(evt) => evt.preventDefault()}>
        {error && (
          <div
            onClick={handlePopoverClose}
            className="border-destructive/30 bg-destructive/5 flex cursor-pointer items-start gap-2 rounded-md border px-4 py-3 text-sm">
            <PiWarningCircleBold className="text-destructive mt-0.5 size-4 shrink-0" />
            <div>
              <div className="font-medium">Error</div>
              <div className="text-muted-foreground">
                {error.message || 'An unexpected error occurred.'}
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
