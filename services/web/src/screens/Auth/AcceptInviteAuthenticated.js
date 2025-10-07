import { Button } from '@mantine/core';

import { useSession } from 'stores/session';

export default function AcceptInviteAuthenticated() {
  const { logout } = useSession();

  return (
    <>
      <h3>Accept Invite</h3>
      <p>
        Invites can only be accepted from a logged out state. Would you like to
        logout and accept the invite?
      </p>
      <div>
        <Button
          onClick={() => {
            logout();
          }}>
          Continue
        </Button>
      </div>
    </>
  );
}
