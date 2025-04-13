import { Link } from '@bedrockio/router';

import { AppShell, Flex, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useClass } from 'helpers/bem';

import Logo from 'components/Logo';
import ConnectionError from 'components/ConnectionError';

import './portal.less';
import { IconArrowBack } from '@tabler/icons-react';

export default function PortalLayout({ children }) {
  const { className, getElementClass } = useClass('portal-layout');
  const [opened, { toggle }] = useDisclosure();

  return (
    <>
      <AppShell>
        <AppShell.Header height="100%">
          <Flex
            h="50px"
            flex="row"
            gap="md"
            justify="space-between"
            align="center"
            p="md">
            <Logo height={20} />
            <Button
              size="compact-sm"
              component={Link}
              to="/"
              rightSection={<IconArrowBack size={14} />}>
              Go to Dashboard
            </Button>
          </Flex>
        </AppShell.Header>
        <AppShell.Main>
          <ConnectionError />
          {children}
        </AppShell.Main>
      </AppShell>
    </>
  );
}
