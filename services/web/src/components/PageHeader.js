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
                  <Text size="sm">{item.title}</Text>
                </Anchor>
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
            variant="pills"
            onChange={(value) => navigate(value)}>
            <Tabs.List mb="md">
              {tabs.map((tab, index) => (
                <Tabs.Tab key={index} value={tab.href}>
                  <Text size="xs" fw="bold">
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
