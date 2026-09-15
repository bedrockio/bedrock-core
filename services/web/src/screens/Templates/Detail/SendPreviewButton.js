import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';

import SendPreviewModal from './SendPreviewModal';

export default function SendPreviewButton(props) {
  return (
    <SendPreviewModal
      {...props}
      trigger={
        <Button variant="outline">
          <Send />
          Test
        </Button>
      }
    />
  );
}
