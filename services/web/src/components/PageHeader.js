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
        <Stack gap="0">
          <Group justify="space-between">
            <Breadcrumbs separatorMargin="xs">
              {breadcrumbItems.map((item, index) =>
                item?.href ? (
                  <Anchor component={Link} to={item.href} key={index}>
                    <Text fw="bold" size="md">
                      {item.title}
                    </Text>
                  </Anchor>
                ) : (
                  <Text key={index} size="md">
                    {item.title}
                  </Text>
                ),
              )}
            </Breadcrumbs>
            <Group>{rightSection}</Group>
          </Group>

          <Title mt={0} order={2}>
            {title}
          </Title>
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
