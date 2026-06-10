import ConnectionError from 'components/ConnectionError';
import Logo from 'components/Logo';

import { Card } from '@/components/ui/card';

export default function BasicLayout({ children }) {
  return (
    <div className="min-h-screen">
      <ConnectionError />
      <div className="flex justify-center px-4 pt-8 sm:pt-30">
        <div className="flex w-full max-w-[480px] flex-col items-center">
          <Logo className="max-w-[200px]" title="Login" />
          <Card className="mt-4 w-full p-6">{children}</Card>
        </div>
      </div>
    </div>
  );
}
