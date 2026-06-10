import { useCallback, useState } from 'react';

/**
 * Boolean open/close state helper for menus, drawers and modals.
 * Returns [opened, { open, close, toggle }].
 */
export function useDisclosure(initial = false) {
  const [opened, setOpened] = useState(initial);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const toggle = useCallback(() => setOpened((o) => !o), []);
  return [opened, { open, close, toggle }];
}

export default useDisclosure;
