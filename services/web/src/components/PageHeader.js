import { Link, useLocation, useNavigate } from '@bedrockio/router';

import {
  Anchor,
  Breadcrumbs,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
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
        <Group justify="space-between">
          <Breadcrumbs separatorMargin="xs">
            {breadcrumbItems.map((item, index) =>
              item?.href ? (
                <Anchor component={Link} to={item.href} key={index}>
                  {item.title}
                </Anchor>
              ) : (
                item.title
              ),
            )}
          </Breadcrumbs>
        </Group>

        <Title mt={0} order={2}>
          <Group justify="space-between">
            {title}
            <Group>{rightSection}</Group>
          </Group>
        </Title>

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
