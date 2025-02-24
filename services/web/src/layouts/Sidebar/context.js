import { createContext, useContext } from 'react';

export const SidebarContext = createContext();

export function useSidebar() {
  return useContext(SidebarContext);
}
