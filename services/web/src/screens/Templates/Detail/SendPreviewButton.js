import { PiPaperPlaneTiltBold } from 'react-icons/pi';

import { Button } from '@/components/ui/button';

import SendPreviewModal from './SendPreviewModal';

export default function SendPreviewButton(props) {
  return (
    <SendPreviewModal
      {...props}
      trigger={
        <Button variant="outline">
          <PiPaperPlaneTiltBold />
          Test
        </Button>
      }
    />
  );
}
