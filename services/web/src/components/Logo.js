import { APP_NAME } from 'utils/env';

import logoLight from 'assets/logo-light.svg';
import logoDark from 'assets/logo-dark.svg';

import { useMantineColorScheme, Image } from '@mantine/core';

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
