import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme';

import { SessionProvider, useSession } from 'src/stores/session';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <SessionProvider>
        <Router />
      </SessionProvider>
    </MantineProvider>
  );
}
