import {
  Breadcrumbs,
  Divider,
  Paper,
  Stack,
  Title,
  rem,
  useMantineTheme,
} from '@mantine/core';

import { useColorScheme } from '@mantine/hooks';

const PageHeader = (props) => {
  const { withActions, breadcrumbItems, title, invoiceAction, ...others } =
    props;
  const theme = useMantineTheme();
  const colorScheme = useColorScheme();

  const BREADCRUMBS_PROPS = {
    style: {
      a: {
        padding: rem(8),
        borderRadius: theme.radius.sm,
        fontWeight: 500,
        color: colorScheme === 'dark' ? theme.white : theme.black,

        '&:hover': {
          transition: 'all ease 150ms',
          backgroundColor:
            colorScheme === 'dark'
              ? theme.colors.dark[5]
              : theme.colors.gray[2],
          textDecoration: 'none',
        },
      },
    },
  };

  return (
    <>
      <Stack gap="sm">
        <Title order={3}>{title}</Title>
        <Breadcrumbs {...BREADCRUMBS_PROPS}>{breadcrumbItems}</Breadcrumbs>
      </Stack>

      <Divider />
    </>
  );
};

export default PageHeader;
