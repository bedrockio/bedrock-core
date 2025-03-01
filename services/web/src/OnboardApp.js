import { Routes, Route, Redirect } from '@bedrockio/router';

import BasicLayout from 'layouts/Basic';

import Onboard from 'screens/Onboard';

function App() {
  return (
    <BasicLayout>
      <Routes>
        <Route path="/onboard" render={Onboard} />
        <Redirect to="/onboard" />
      </Routes>
    </BasicLayout>
  );
}

export default App;
