import { Link } from 'react-router-dom';

import { default as NotFoundScreen } from 'screens/NotFound';

export default function NotFound() {
  return (
    <NotFoundScreen
      link={<Link to="/users">Users</Link>}
      message="Sorry that user wasn't found."
    />
  );
}
