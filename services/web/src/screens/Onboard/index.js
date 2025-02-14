import React, { useState } from 'react';
import { Redirect } from '@bedrockio/router';
import { Form, Segment } from 'semantic';
import { startCase, pick } from 'lodash';

import screen from 'helpers/screen';
import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import EmailField from 'components/form-fields/Email';
import PhoneField from 'components/form-fields/Phone';
import LogoTitle from 'components/LogoTitle';

import { request } from 'utils/api';

const FIELDS = [
  {
    name: 'phone',
    required: true,
  },
];

function OnboardScreen() {
  const { user, updateUser } = useSession();

  const [body, setBody] = useState(() => {
    return pick(
      user,
      FIELDS.map((f) => f.name)
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

  function render() {
    return (
      <React.Fragment>
        <LogoTitle title="Tell Us More" />
        <Form loading={loading} onSubmit={onSubmit} noValidate>
          <Segment.Group>
            <Segment padded>
              {error?.type !== 'validation' && <ErrorMessage error={error} />}
              {!user.email && (
                <EmailField
                  name="email"
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
              <Form.Button
                fluid
                primary
                size="large"
                content="Continue"
                loading={loading}
                disabled={loading}
              />
            </Segment>
          </Segment.Group>
        </Form>
      </React.Fragment>
    );
  }

  if (isValidUser(user)) {
    return <Redirect to="/" />;
  }

  return render();
}

export default screen(OnboardScreen);
