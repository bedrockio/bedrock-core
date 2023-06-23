import { useState } from 'react';

export function useMergedState(initial) {
  const [state, setState] = useState(initial);

  function setMergedState(updated) {
    setState({
      ...state,
      ...updated,
    });
  }

  return [state, setMergedState];
}
