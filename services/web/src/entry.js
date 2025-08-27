import { createRoot } from 'react-dom/client';

import Wrapper from './Wrapper';

const root = createRoot(document.getElementById('root'));

root.render(<Wrapper />);

if (import.meta.hot) {
  // HMR re-renders the entire tree here. This is
  // only needed in Vite because it's not .jsx
  // If this wasn't here HMR would perform a full
  // page reload. This is much faster but note it
  // does still re-render the entire React root.
  import.meta.hot.accept('./Wrapper.js', (newModule) => {
    const NextWrapper = newModule.default;
    root.render(<NextWrapper />);
  });
}
