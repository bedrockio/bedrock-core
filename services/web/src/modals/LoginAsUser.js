import { JWT_KEY, request } from 'utils/api';

import Confirm from './Confirm';

export default function LoginAsUser(props) {
  const { user, ...rest } = props;

  async function onConfirm() {
    const { data } = await request({
      method: 'POST',
      path: `/1/users/${user.id}/authenticate`,
    });
    const tab = window.open(`/`, '_blank');
    tab.sessionStorage.setItem(JWT_KEY, data.token);
  }

  return (
    <Confirm
      {...rest}
      onConfirm={onConfirm}
      content={
        <div>
          Are you sure you want to log in as {user.email}? The session will be
          valid for 2 hours only.
        </div>
      }
    />
  );
}
