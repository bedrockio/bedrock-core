import { useSession } from 'stores/session';

import ErrorScreen from 'screens/Error';
import LoadingScreen from 'screens/Loading';

export default function SessionSwitch({ children }) {
  const { ready, error } = useSession();
  if (!ready) {
    return <LoadingScreen />;
  } else if (error) {
    return <ErrorScreen error={error} />;
  } else {
    return children;
  }
}
