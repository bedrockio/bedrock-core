import { useCallback, useState } from 'react';

/**
 * Local replacement for the Mantine useDisclosure.
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
