import {
  Button,
  Fieldset,
  LoadingOverlay,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';

import { showSuccessNotification } from 'helpers/notifications';

import ErrorMessage from 'components/ErrorMessage';
import Protected from 'components/Protected';
import Actions from 'components/form-fields/Actions';
import PhoneField from 'components/form-fields/Phone';
import RolesField from 'components/form-fields/Roles';
import UploadsField from 'components/form-fields/Uploads';
import { useFields } from 'hooks/forms';
import { useRequest } from 'hooks/request';

import { request } from 'utils/api';

export default function UserForm(props) {
  const { user } = props;

  const { fields, setField } = useFields({
    roles: [],
    ...user,
  });

  const { run, loading, error } = useRequest(async (body) => {
    if (user) {
      const { data } = await request({
        method: 'PATCH',
        path: `/1/users/${user.id}`,
        body,
      });
      showSuccessNotification({
        message: 'User Updated',
      });
      props.onSuccess?.(data);
    } else {
      const { data } = await request({
        method: 'POST',
        path: '/1/users',
        body,
      });
      showSuccessNotification({
        message: 'User Created',
      });
      props.onSuccess?.(data);
    }
  });

  function onSubmit(evt) {
    evt.preventDefault();
    run(fields);
  }

  return (
    <form onSubmit={onSubmit}>
      <ErrorMessage error={error} />
      <LoadingOverlay visible={loading} />
      <Fieldset legend="Profile">
        <TextInput
          required
          name="firstName"
          label="First Name"
          value={fields.firstName || ''}
          onChange={setField}
        />
        <TextInput
          required
          name="lastName"
          label="Last Name"
          value={fields.lastName || ''}
          onChange={setField}
        />

        <TextInput
          required
          name="email"
          label="Email"
          value={fields.email || ''}
          onChange={setField}
        />
        <PhoneField
          name="phone"
          label="Phone Number"
          value={fields.phone || ''}
          onChange={setField}
        />
        <UploadsField
          type="image"
          name="image"
          label="Image"
          value={fields.image}
          onChange={setField}
        />
      </Fieldset>
      <Fieldset legend="Other">
        <Protected endpoint="users" permission="write">
          <RolesField
            name="roles"
            scope="global"
            label="Roles"
            value={fields.roles}
            onChange={setField}
          />
        </Protected>

        <div>
          <Text fz="sm" fw="500" mt="xs">
            Flags
          </Text>

          <Switch
            name="isTester"
            label="Tester"
            checked={fields.isTester}
            onChange={setField}
            p="0.5em 0"
          />
        </div>
      </Fieldset>
      <Actions>
        <Button type="submit">Submit</Button>
      </Actions>
    </form>
  );
}
