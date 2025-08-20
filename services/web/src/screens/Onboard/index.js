import { useState } from 'react';
import { Redirect } from '@bedrockio/router';
import { Button, Paper, Stack, TextInput } from '@mantine/core';
import { startCase, pick } from 'lodash';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';

import PhoneField from 'components/form-fields/Phone';
import Logo from 'components/Logo';
import Meta from 'components/Meta';

import { request } from 'utils/api';

const FIELDS = [
  {
    name: 'phone',
    required: true,
  },
];

export default function OnboardScreen() {
  const { user, updateUser } = useSession();

  const [body, setBody] = useState(() => {
    return pick(
      user,
      FIELDS.map((f) => f.name),
    );
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function validateFields(user) {
    for (let field of FIELDS) {
      if (field.required && !user[field.name]) {
        throw new Error(`${startCase(field.name)} is required.`);
      }
    }
  }

  function isValidUser(user) {
    try {
      validateFields(user);
      return true;
    } catch {
      return false;
    }
  }

  function setField(evt, { name, value }) {
    setBody({
      ...body,
      [name]: value,
    });
  }

  async function onSubmit() {
    try {
      setError(null);
      setLoading(true);

      validateFields(body);

      const { data } = await request({
        method: 'PATCH',
        path: '/1/users/me',
        body,
      });

      updateUser(data);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  if (isValidUser(user)) {
    return <Redirect to="/" />;
  }

  return (
    <Stack>
      <Meta title="Tell Us More" />
      <Logo />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        noValidate>
        <Paper shadow="xs" p="md" withBorder>
          <Stack>
            {error?.type !== 'validation' && <ErrorMessage error={error} />}
            {!user.email && (
              <TextInput
                name="email"
                type="email"
                value={body.email || ''}
                onChange={setField}
                error={error}
              />
            )}
            {!user.phone && (
              <PhoneField
                name="phone"
                value={body.phone || ''}
                onChange={setField}
                error={error}
              />
            )}
            <Button
              fullWidth
              type="submit"
              color="blue"
              size="lg"
              loading={loading}
              disabled={loading}>
              Continue
            </Button>
          </Stack>
        </Paper>
      </form>
    </Stack>
  );
}
