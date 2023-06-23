import { Link } from 'react-router-dom';

import { default as NotFoundScreen } from 'screens/NotFound';

export default function NotFound() {
  return (
    <NotFoundScreen
      link={<Link to="/products">Products</Link>}
      message="Sorry that product wasn't found."
    />
  );
}
