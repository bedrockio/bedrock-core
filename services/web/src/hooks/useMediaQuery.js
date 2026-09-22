import { useEffect, useState } from 'react';

/**
 * Local replacement for the Mantine useMediaQuery.
 * Returns true when the media query matches.
 */
export function useMediaQuery(query, initial = false) {
  const [matches, setMatches] = useState(initial);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export default useMediaQuery;
