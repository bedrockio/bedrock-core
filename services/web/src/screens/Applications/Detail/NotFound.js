import { Link } from 'react-router-dom';

import { default as NotFoundScreen } from 'screens/NotFound';

export default function NotFound() {
  return (
    <NotFoundScreen
      link={<Link to="/applications">Applications</Link>}
      message="Sorry that application wasn't found."
    />
  );
}
