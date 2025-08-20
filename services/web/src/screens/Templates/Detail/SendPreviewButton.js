import { Button } from '@mantine/core';
import { PiPaperPlaneTiltFill } from 'react-icons/pi';

import ModalWrapper from 'components/ModalWrapper';

import SendPreviewModal from './SendPreviewModal';

export default function SendPreviewButton(props) {
  return (
    <ModalWrapper
      title="Send Test"
      trigger={
        <Button variant="default" leftSection={<PiPaperPlaneTiltFill />}>
          Test
        </Button>
      }
      component={<SendPreviewModal {...props} />}
    />
  );
}
