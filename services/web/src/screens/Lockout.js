import { useEffect } from 'react';
import { useNavigate, Link } from '@bedrockio/router';
import { Button, Paper, Text, Group, Center, Stack } from '@mantine/core';

import { useSession } from 'stores/session';

function Lockout() {
  const navigate = useNavigate();
  const { isLoggedIn } = useSession();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  return (
    <Center style={{ height: '100vh' }}>
      <Paper>
        <Stack gap="md">
          <Text>This site cannot be accessed.</Text>

          <Group position="right">
            <Button component={Link} to="/logout">
              Logout
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Center>
  );
}

export default Lockout;
