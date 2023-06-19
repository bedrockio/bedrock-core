import { pick } from 'lodash';
import React, { useState } from 'react';
import { Button, Divider, Form, Segment } from 'semantic';

import screen from 'helpers/screen';
import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';

import { useMergedState } from 'utils/hooks';

import Menu from './Menu';

function Account() {
  const { user, updateSelf } = useSession();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useMergedState(
    pick(user, ['firstName', 'lastName'])
  );

  function setField(evt, { name, value }) {
    setFields({
      [name]: value,
    });
  }

  async function submit() {
    try {
      setLoading(true);
      await updateSelf(fields);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <React.Fragment>
      <Menu />
      <Divider hidden />
      <ErrorMessage error={error} />
      <Form onSubmit={submit}>
        <Segment>
          <Form.Input
            type="text"
            name="firstName"
            label="First Name"
            value={fields.firstName || ''}
            onChange={setField}
          />
          <Form.Input
            type="text"
            name="lastName"
            label="Last Name"
            value={fields.lastName || ''}
            onChange={setField}
          />
        </Segment>
        <div>
          <Button primary content="Save" loading={loading} disabled={loading} />
        </div>
      </Form>
    </React.Fragment>
  );
}

export default screen(Account);
