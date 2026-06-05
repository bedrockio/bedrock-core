import { useState } from 'react';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import ModalWrapper, { useModalContext } from 'components/ModalWrapper';
import SearchDropdown from 'components/SearchDropdown';
import EmailField from 'components/form-fields/Email';
import PhoneField from 'components/form-fields/Phone';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { request } from 'utils/api';
import { notifySuccess } from 'utils/notify';

function SendPreviewModal(props) {
  const { channel, template } = props;
  const { user } = useSession();
  const { close } = useModalContext();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [fields, setFields] = useState(() => {
    if (channel === 'email') {
      return { email: user.email };
    } else if (channel === 'sms') {
      return { phone: user.phone };
    } else if (channel === 'push') {
      return { userId: user.id };
    }
  });

  function setField(name, value) {
    setFields({
      ...fields,
      [name]: value,
    });
  }

  async function onSubmit(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    try {
      setError(null);
      setLoading(true);
      await request({
        method: 'POST',
        path: `/1/templates/${template.id}/send`,
        body: {
          channel,
          ...fields,
        },
      });
      setLoading(false);
      notifySuccess({
        message: 'Test message sent.',
      });

      close();
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  function renderField() {
    if (channel === 'email') {
      return renderEmail();
    } else if (channel === 'sms') {
      return renderSms();
    } else if (channel === 'push') {
      return renderPush();
    }
  }

  function renderEmail() {
    return (
      <EmailField
        name="email"
        label="Email"
        value={fields.email || ''}
        onChange={(evt) => setField('email', evt.target.value)}
      />
    );
  }

  function renderSms() {
    return (
      <PhoneField
        name="phone"
        label="Phone"
        value={fields.phone || ''}
        onChange={setField}
      />
    );
  }

  function renderPush() {
    return (
      <SearchDropdown
        label="User"
        name="userId"
        objectMode={false}
        value={fields.userId || ''}
        searchPath="/1/templates/push-users/search"
        placeholder="Search Users"
        onChange={(value) => setField('userId', value)}
      />
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <ErrorMessage error={error} />
        {renderField()}
        <Alert variant="info">
          <AlertDescription>
            Dummy data will be used to populate objects.
          </AlertDescription>
        </Alert>
        <Button type="submit" disabled={loading}>
          {loading && <Spinner className="text-current" />}
          Send
        </Button>
      </div>
    </form>
  );
}

function Wrapper(props) {
  const { trigger, ...rest } = props;
  return (
    <ModalWrapper title="Send Test" trigger={trigger}>
      <SendPreviewModal {...rest} />
    </ModalWrapper>
  );
}
export default Wrapper;
