import { Link, useLocation, useNavigate } from '@bedrockio/router';
import {
  Breadcrumbs,
  Tabs,
  Stack,
  Title,
  rem,
  Group,
  useMantineTheme,
  Text,
} from '@mantine/core';

import { useColorScheme } from '@mantine/hooks';

const PageHeader = ({
  tabs = [],
  breadcrumbItems = [],
  title,
  rightSection,
}) => {
  const theme = useMantineTheme();
  const colorScheme = useColorScheme();
  const location = useLocation();
  const navigate = useNavigate();

  const BREADCRUMBS_PROPS = {
    style: {
      a: {
        padding: rem(4),
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
      <Stack>
        <Stack gap="xs">
          <Breadcrumbs {...BREADCRUMBS_PROPS}>
            {breadcrumbItems.map((item, index) =>
              item?.href ? (
                <Link to={item.href} key={index}>
                  <Text size="sm">{item.title}</Text>
                </Link>
              ) : (
                <Text key={index} size="sm">
                  {item.title}
                </Text>
              ),
            )}
          </Breadcrumbs>

          <Group justify="space-between">
            <Title order={2}>{title}</Title>
            <Group>{rightSection}</Group>
          </Group>
        </Stack>

        {tabs.length > 0 && (
          <Tabs
            value={location.pathname}
            styles={{
              tab: {
                padding: 'var(--mantine-spacing-xs) 0',
                marginRight: 'var(--mantine-spacing-md)',
              },
            }}
            onChange={(value) => navigate(value)}>
            <Tabs.List mb="md">
              {tabs.map((tab, index) => (
                <Tabs.Tab key={index} value={tab.href}>
                  <Text size="sm">{tab.title}</Text>
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        )}
      </Stack>
    </>
  );
};

export default PageHeader;
