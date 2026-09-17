import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * Unsaved-changes guard for page-based create/edit forms. A form registers its
 * dirty state via `setDirty`; the dismiss controls (CloseButton ✕, CancelButton)
 * route their navigation through `guard`, which — when the form is dirty — asks
 * the user to confirm before leaving instead of silently discarding input.
 *
 * The default context is a no-op passthrough, so a control rendered outside a
 * provider simply navigates.
 */
const UnsavedGuardContext = createContext({
  setDirty: () => {},
  guard: (proceed) => proceed(),
});

export function useUnsavedGuard() {
  return useContext(UnsavedGuardContext);
}

/**
 * Register a form's dirty state with the guard. Call once in a form with its
 * react-hook-form `formState.isDirty`; clears on unmount.
 */
export function useRegisterDirty(isDirty) {
  const { setDirty } = useUnsavedGuard();
  useEffect(() => {
    setDirty(isDirty);
    return () => setDirty(false);
  }, [isDirty, setDirty]);
}

export function UnsavedGuardProvider({ children }) {
  const dirtyRef = useRef(false);
  const pendingRef = useRef(null);
  const [open, setOpen] = useState(false);

  const setDirty = useCallback((value) => {
    dirtyRef.current = value;
  }, []);

  const guard = useCallback((proceed) => {
    if (dirtyRef.current) {
      pendingRef.current = proceed;
      setOpen(true);
    } else {
      proceed();
    }
  }, []);

  function keepEditing() {
    pendingRef.current = null;
    setOpen(false);
  }

  function discard() {
    const proceed = pendingRef.current;
    pendingRef.current = null;
    dirtyRef.current = false;
    setOpen(false);
    proceed?.();
  }

  return (
    <UnsavedGuardContext.Provider value={{ setDirty, guard }}>
      {children}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) keepEditing();
        }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. If you leave now, they’ll be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={keepEditing}>
              Keep editing
            </Button>
            <Button variant="destructive" onClick={discard}>
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UnsavedGuardContext.Provider>
  );
}
