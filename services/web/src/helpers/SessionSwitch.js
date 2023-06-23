import { useSession } from 'stores/session';

import LoadingScreen from 'screens/Loading';
import ErrorScreen from 'screens/Error';

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
