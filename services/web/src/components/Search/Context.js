import React, { useContext } from 'react';

export const SearchContext = React.createContext();

export function useSearch() {
  return useContext(SearchContext);
}
