import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';

import SendPreviewModal from './SendPreviewModal';

export default function SendPreviewButton({
  variant = 'outline',
  size,
  label = 'Test',
  ...props
}) {
  return (
    <SendPreviewModal
      {...props}
      trigger={
        <Button variant={variant} size={size}>
          <Send />
          {label}
        </Button>
      }
    />
  );
}
