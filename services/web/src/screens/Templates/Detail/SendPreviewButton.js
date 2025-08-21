import { Button } from 'semantic';

import SendPreviewModal from './SendPreviewModal';

export default function SendPreviewButton(props) {
  return (
    <SendPreviewModal
      {...props}
      trigger={<Button basic content="Test" icon="paper-plane" type="button" />}
    />
  );
}
