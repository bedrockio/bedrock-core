import { Link, Redirect, useLocation, useNavigate } from '@bedrockio/router';
import React, { useEffect, useMemo, useState } from 'react';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import Meta from 'components/Meta';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

import { request } from 'utils/api';
import { formatPhone } from 'utils/phone';

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

  const [code, setCode] = useState(state.code || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    login();
  }, []);

  async function login(value = code) {
    const { email, phone, channel } = state;

    if (!(value && (email || phone))) {
      return;
    }

    try {
      setLoading(true);
      const method = channel === 'authenticator' ? 'totp' : 'otp';

      const { data } = await request({
        method: 'POST',
        path: `/1/auth/${method}/login`,
        body: {
          code: value,
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

  function renderMessage() {
    const { channel, type } = state;
    if (type === 'link') {
      if (channel === 'email') {
        return `Please click on the link sent to ${state.email}.`;
      } else if (channel === 'sms') {
        return `Please click on the link sent to ${formatPhone(state.phone)}.`;
      }
    } else {
      if (channel === 'email') {
        return `Please enter the code sent to ${state.email}.`;
      } else if (channel === 'sms') {
        return `Please enter the code sent to ${formatPhone(state.phone)}.`;
      } else if (channel === 'authenticator') {
        return 'Please enter the code from your authenticator app.';
      }
    }
  }

  if (!state) {
    return <Redirect to="/login" />;
  }

  const showInput = state.type !== 'link' && !state.code;

  return (
    <React.Fragment>
      <Meta title="Confirm Code" />
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Confirm Code</h1>
      <div className="flex flex-col gap-4">
        <Alert variant="success">
          <AlertDescription>{renderMessage()}</AlertDescription>
        </Alert>
        {showInput && (
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            disabled={loading}
            onComplete={(value) => login(value)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        )}
        <ErrorMessage error={error} />
      </div>
      <div className="mt-4">
        <Link className="text-foreground no-underline hover:underline" to="/login">
          Back
        </Link>
      </div>
    </React.Fragment>
  );
}
