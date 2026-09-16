import React, { use } from 'react';

export const SearchContext = React.createContext();

export function useSearch() {
  return use(SearchContext);
}
