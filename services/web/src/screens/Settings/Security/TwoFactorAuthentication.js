import { useState } from 'react';

import { useSession } from 'stores/session';

import Authenticator from 'components/Authenticator';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useRequest } from 'utils/api';
import { notify } from 'utils/notify';

const METHODS = [
  { label: 'None', value: 'none' },
  { label: 'SMS', value: 'sms' },
  { label: 'Email', value: 'email' },
  { label: 'Authenticator', value: 'totp' },
];

export default function Sessions() {
  const { user, updateUser } = useSession();

  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);

  const mfaRequest = useRequest({
    method: 'PATCH',
    path: '/1/auth/mfa-method',
    onSuccess: ({ data }) => {
      updateUser({
        mfaMethod: data.mfaMethod,
        authenticators: data.authenticators,
      });

      notify({
        position: 'top-right',
        title: 'Success',
        message:
          data.mfaMethod === 'none'
            ? 'Two-factor authentication disabled.'
            : 'Two-factor authentication enabled.',
        color: 'green',
      });
    },
    onError: (error) => {
      notify({
        position: 'top-right',
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  });

  const removeTotpRequest = useRequest({
    method: 'POST',
    path: '/1/auth/totp/disable',
    onSuccess: ({ data }) => {
      updateUser({
        mfaMethod: data.mfaMethod,
        authenticators: data.authenticators,
      });
    },
    onError: (error) => {
      notify({
        position: 'top-right',
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  });

  function onMfaMethodChange(value) {
    if (value === 'totp' && !hasTotp) {
      setAuthenticatorOpen(true);
    } else {
      mfaRequest.request({
        body: {
          method: value,
        },
      });
    }
  }

  const hasTotp = user.authenticators.some(
    (authenticator) => authenticator.type === 'totp',
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">Select how you want to verify your identity</p>
      <Select
        value={user.mfaMethod}
        disabled={mfaRequest.loading}
        onValueChange={onMfaMethodChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {METHODS.map((method) => (
            <SelectItem key={method.value} value={method.value}>
              {method.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasTotp && user.mfaMethod === 'totp' && (
        <div className="flex">
          <Button
            variant="destructive"
            onClick={() => {
              removeTotpRequest.request();
            }}
            disabled={removeTotpRequest.loading}>
            Reset Authenticator Configuration
          </Button>
        </div>
      )}

      <Dialog open={authenticatorOpen} onOpenChange={setAuthenticatorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Authenticator</DialogTitle>
          </DialogHeader>
          <Authenticator
            onClose={() => setAuthenticatorOpen(false)}
            onSuccess={() => {
              notify({
                position: 'top-right',
                title: 'Success',
                message: 'Two-factor authentication enabled.',
                color: 'green',
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
