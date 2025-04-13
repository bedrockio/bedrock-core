import React, { useEffect, useMemo, useState } from 'react';
import { Redirect, Link, useNavigate, useLocation } from '@bedrockio/router';
import { Dimmer, Grid, Loader, Message, Segment } from 'semantic';
import { Paper, PinInput } from '@mantine/core';

import { useSession } from 'stores/session';

import LogoTitle from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';
import Meta from 'components/Meta';

import { formatPhone } from 'utils/phone';

import { request } from 'utils/api';

export default function ConfirmCode() {
  const { authenticate } = useSession();

  const navigate = useNavigate();
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
    const { email, phone, channel } = state;

    if (!canLogin()) {
      return;
    }

    try {
      const method = channel === 'authenticator' ? 'totp' : 'otp';

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
      navigate('/onboard');
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  function canLogin() {
    const { email, phone } = state;
    return code && (email || phone);
  }

  function render() {
    return (
      <>
        <Meta title="Confirm Code" />
        <LogoTitle title="Confirm Code" />
        <Paper>
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
        </Paper>
      </>
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
    const { channel } = state;
    if (channel === 'email') {
      return `Please click on the link sent to ${state.email}.`;
    } else if (channel === 'sms') {
      return `Please click on the link sent to ${formatPhone(state.phone)}.`;
    }
  }

  function renderCode() {
    return (
      <React.Fragment>
        <Message success>{renderCodeMessage()}</Message>
        <form>
          {!state.code && (
            <PinInput
              length={6}
              //type="numeric"
              size="lg"
              value={code}
              onChange={(value) => {
                setCode(value);
              }}
              onComplete={() => {
                setLoading(true);
                login();
              }}
              disabled={loading}
            />
          )}
        </form>
        <ErrorMessage error={error} />
      </React.Fragment>
    );
  }

  function renderCodeMessage() {
    const { channel } = state;
    if (channel === 'email') {
      return `Please enter the code sent to ${state.email}.`;
    } else if (channel === 'sms') {
      return `Please enter the code sent to ${formatPhone(state.phone)}.`;
    } else if (channel === 'authenticator') {
      return 'Please enter the code from your authenticator app.';
    }
  }

  if (!state) {
    return <Redirect to="/login" />;
  }

  return render();
}
