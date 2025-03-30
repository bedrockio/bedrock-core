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

  const handleEmailKeyDown = (e) => {
    // reset errors
    setInvalidEmails([]);

    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();

      const inputValue = e.currentTarget.value.trim();
      if (!inputValue) return;

      const emailList = inputValue.split(/[,;\s]+/).filter(Boolean);
      const validEmails = [];
      const newInvalidEmails = [];

      emailList.forEach((email) => {
        const trimmedEmail = email.toLowerCase();
        // Check if email is valid and not already in the form
        if (
          validateEmail(trimmedEmail) &&
          !form.values.emails.includes(trimmedEmail)
        ) {
          validEmails.push(trimmedEmail);
        } else if (!validateEmail(trimmedEmail)) {
          newInvalidEmails.push(trimmedEmail);
        }
      });

      if (validEmails.length > 0) {
        form.setFieldValue('emails', [...form.values.emails, ...validEmails]);
      }
      if (newInvalidEmails.length > 0) {
        setInvalidEmails([...invalidEmails, ...newInvalidEmails]);
      }

      // Clear the input
      e.currentTarget.value = '';
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
                //onChange={handleEmailInput}
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
