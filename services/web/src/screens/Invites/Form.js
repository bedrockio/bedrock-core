import { useState } from 'react';
import ErrorMessage from 'components/ErrorMessage';
import {
  Select,
  Stack,
  Button,
  Alert,
  PillsInput,
  Pill,
  Text,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import { emailRegexp } from 'utils/validate';
import { useRequest } from 'utils/api';

export default function InviteForm({ onSuccess = () => {} }) {
  const [invalidEmails, setInvalidEmails] = useState([]);

  const form = useForm({
    initialValues: {
      emails: [],
      role: '',
    },
    validate: {
      emails: (value) =>
        value.length === 0 ? 'At least one email is required' : null,
      role: (value) => (!value ? 'Role is required' : null),
    },
  });

  const { loading, error, request } = useRequest({
    manual: true,
    method: 'POST',
    path: '/1/invites',
  });

  const validateEmail = (email) => {
    return email.match(emailRegexp);
  };

  const handleEmailInput = (e) => {
    const inputValue = e.currentTarget.value;

    if (!inputValue.trim()) return;

    // Check for separator characters (comma, semicolon, space)
    if ([',', ';', ' ', '\n'].includes(inputValue.slice(-1))) {
      const email = inputValue.slice(0, -1).trim().toLowerCase();

      if (email && validateEmail(email)) {
        // Add valid email to form
        form.setFieldValue('emails', [...form.values.emails, email]);
      } else if (email) {
        // Track invalid email
        setInvalidEmails([...invalidEmails, email]);
      }

      // Clear the input
      e.currentTarget.value = '';
    }
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();

      const email = e.currentTarget.value.trim().toLowerCase();

      if (email) {
        if (validateEmail(email)) {
          form.setFieldValue('emails', [...form.values.emails, email]);
        } else {
          setInvalidEmails([...invalidEmails, email]);
        }

        // Clear the input
        e.currentTarget.value = '';
      }
    }
  };

  const removeEmail = (index) => {
    const updatedEmails = [...form.values.emails];
    updatedEmails.splice(index, 1);
    form.setFieldValue('emails', updatedEmails);
  };

  const onSubmit = async (values) => {
    if (values.emails.length === 0) return;

    try {
      const invite = await request({
        body: {
          role: values.role,
          emails: values.emails,
        },
      });

      onSuccess(invite);
    } catch (e) {
      // Error handling is managed by useRequest
    }
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <ErrorMessage error={error} />

        {invalidEmails.length > 0 && (
          <Alert color="red" title="Invalid emails">
            The following emails are invalid: {invalidEmails.join(', ')}
          </Alert>
        )}

        <div>
          <Text size="sm" fw={500} mb={3}>
            Enter email addresses
          </Text>
          <PillsInput {...form.getInputProps('emails')}>
            <Stack>
              {form.values.emails.length > 0 && (
                <Pill.Group>
                  {form.values.emails.map((email, index) => (
                    <Pill
                      key={index}
                      withRemoveButton
                      onRemove={() => removeEmail(index)}>
                      {email}
                    </Pill>
                  ))}
                </Pill.Group>
              )}
              <PillsInput.Field
                mt="2px"
                placeholder="Type or paste emails and press Enter"
                onKeyDown={handleEmailKeyDown}
                onChange={handleEmailInput}
              />
            </Stack>
          </PillsInput>
          {form.errors.emails && (
            <Text size="xs" c="red" mt={4}>
              {form.errors.emails}
            </Text>
          )}
        </div>

        <Select
          label="Role"
          placeholder="Choose Role"
          {...form.getInputProps('role')}
          data={[
            {
              label: 'Viewer',
              value: 'viewer',
            },
            {
              label: 'Admin',
              value: 'admin',
            },
            {
              label: 'Super Admin',
              value: 'superAdmin',
            },
          ]}
        />

        <Button
          type="submit"
          loading={loading}
          disabled={form.values.emails.length === 0}>
          Invite Members{' '}
          {form.values.emails.length > 0
            ? `(${form.values.emails.length})`
            : ''}
        </Button>
      </Stack>
    </form>
  );
}
