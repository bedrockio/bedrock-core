import React from 'react';
import AppWrapper from 'components/AppWrapper';
import { useHistory } from 'react-router-dom';
import { useAppSession } from 'contexts/appSession';

const Dashboard = () => {
  const history = useHistory();
  const { user } = useAppSession();

  React.useEffect(() => {
    history.push('/shops');
  }, []);

  return (
    <AppWrapper>
      Hello {user.name} ({user.email}) from dashboard
    </AppWrapper>
  );
};

export default Dashboard;
