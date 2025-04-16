import { Link, useLocation, useNavigate } from '@bedrockio/router';
import {
  Breadcrumbs,
  Tabs,
  Stack,
  Title,
  Group,
  Text,
  Anchor,
} from '@mantine/core';

import Meta from './Meta';

const PageHeader = ({
  tabs = [],
  breadcrumbItems = [],
  title,
  rightSection,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <Meta title={title} />
      <Stack>
        <Stack gap="xs">
          <Breadcrumbs>
            {breadcrumbItems.map((item, index) =>
              item?.href ? (
                <Anchor component={Link} to={item.href} key={index}>
                  <Text size="xs">{item.title}</Text>
                </Anchor>
              ) : (
                <Text key={index} size="xs">
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
            variant="default"
            value={location.pathname}
            onChange={(value) => navigate(value)}>
            <Tabs.List>
              {tabs.map((tab, index) => (
                <Tabs.Tab
                  leftSection={tab.icon}
                  key={index}
                  value={tab.href}
                  color="primary">
                  <Text size="sm" fw="bold">
                    {tab.title}
                  </Text>
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
