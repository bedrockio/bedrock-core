import { Button } from '@mantine/core';
import { PiPaperPlaneTiltBold } from 'react-icons/pi';

import SendPreviewModal from './SendPreviewModal';

export default function SendPreviewButton(props) {
  return (
    <SendPreviewModal
      {...props}
      trigger={
        <Button variant="default" leftSection={<PiPaperPlaneTiltBold />}>
          Test
        </Button>
      }
    />
  );
}
