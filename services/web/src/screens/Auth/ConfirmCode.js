import React, { useEffect, useMemo, useState } from 'react';
import { Redirect, Link, useHistory, useLocation } from 'react-router-dom';
import { Dimmer, Form, Grid, Loader, Message, Segment } from 'semantic';

import screen from 'helpers/screen';
import { useSession } from 'stores/session';

import LogoTitle from 'components/LogoTitle';
import CodeField from 'components/form-fields/Code';
import ErrorMessage from 'components/ErrorMessage';

import { formatPhone } from 'utils/phone';

import { request } from 'utils/api';

function ConfirmCode() {
  const { authenticate } = useSession();

  const history = useHistory();
  const location = useLocation();

  const state = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      ...Object.fromEntries(params.entries()),
      ...location.state,
    };
  }, []);

  const [code, setCode] = useState(state.code);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    login();
  }, []);

  async function login() {
    const { email, phone, transport } = state;

    if (!canLogin()) {
      return;
    }

    try {
      const method = transport === 'authenticator' ? 'totp' : 'otp';

      const { data } = await request({
        method: 'POST',
        path: `/1/auth/${method}/login`,
        body: {
          code,
          email,
          phone,
        },
      });

      await authenticate(data.token);
      history.push('/onboard');
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  function canLogin() {
    const { email, phone } = state;
    return code && (email || phone);
  }

  function onCodeChange(evt, { value }) {
    setCode(value);
  }

  function onCodeComplete() {
    setLoading(true);
    login();
  }

  function render() {
    return (
      <React.Fragment>
        <LogoTitle title="Confirm Code" />
        <Segment.Group>
          {loading && (
            <Dimmer inverted active>
              <Loader />
            </Dimmer>
          )}
          <Segment padded>{renderMessage()}</Segment>
          <Segment secondary>
            <Grid>
              <Grid.Column floated="left" width={12}>
                <Link to="/login">Back</Link>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }

  function renderMessage() {
    if (state.type === 'link') {
      return renderLink();
    } else {
      return renderCode();
    }
  }

  function renderLink() {
    return (
      <React.Fragment>
        <Message success>{renderLinkMessage()}</Message>
        <ErrorMessage error={error} />
      </React.Fragment>
    );
  }

  function renderLinkMessage() {
    const { transport } = state;
    if (transport === 'email') {
      return `Please click on the link sent to ${state.email}.`;
    } else if (transport === 'sms') {
      return `Please click on the link sent to ${formatPhone(state.phone)}.`;
    }
  }

  function renderCode() {
    return (
      <React.Fragment>
        <Message success>{renderCodeMessage()}</Message>
        <Form>
          {!state.code && (
            <CodeField
              disabled={loading}
              value={code || ''}
              onChange={onCodeChange}
              onComplete={onCodeComplete}
              error={error}
            />
          )}
        </Form>
        <ErrorMessage error={error} />
      </React.Fragment>
    );
  }

  function renderCodeMessage() {
    const { transport } = state;
    if (transport === 'email') {
      return `Please enter the code sent to ${state.email}.`;
    } else if (transport === 'sms') {
      return `Please enter the code sent to ${formatPhone(state.phone)}.`;
    } else if (transport === 'authenticator') {
      return 'Please enter the code from your authenticator app.';
    }
  }

  if (!state) {
    return <Redirect to="/login" />;
  }

  return render();
}

export default screen(ConfirmCode);
