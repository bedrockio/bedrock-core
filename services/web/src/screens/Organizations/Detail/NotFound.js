import { Link } from 'react-router-dom';

import { default as NotFoundScreen } from 'screens/NotFound';

export default function NotFound() {
  return (
    <NotFoundScreen
      link={<Link to="/shops">Shops</Link>}
      message="Sorry that shop wasn't found."
    />
  );
}
