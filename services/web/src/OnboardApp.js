import { Redirect, Route, Routes } from '@bedrockio/router';

import BasicLayout from 'layouts/Basic';

import Onboard from 'screens/Onboard';

export default function OnboardApp() {
  return (
    <BasicLayout>
      <Routes>
        <Route path="/onboard" render={Onboard} />
        <Redirect to="/onboard" />
      </Routes>
    </BasicLayout>
  );
}
