import { Image, useMantineColorScheme } from '@mantine/core';

import logoDark from 'assets/logo-dark.svg';
import logoLight from 'assets/logo-light.svg';

import { APP_NAME } from 'utils/env';

export default function Logo(props) {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Image
      src={colorScheme === 'dark' ? logoDark : logoLight}
      alt={APP_NAME}
      {...props}
    />
  );
}
