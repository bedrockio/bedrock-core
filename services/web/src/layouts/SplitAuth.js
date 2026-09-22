import { CircleCheck } from 'lucide-react';

import ConnectionError from 'components/ConnectionError';

import { Card } from '@/components/ui/card';

import { APP_NAME } from 'utils/env';

import logoIcon from 'assets/logo-icon.svg';

const BULLETS = [
  'Organizations, shops, products, and users — one dashboard',
  'Role-based access, backed by a full audit log',
  'White-label from a single color token',
];

export default function SplitAuthLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      <ConnectionError />

      <div className="auth-ground relative flex flex-[2] items-center justify-center px-6 py-16 sm:px-10">
        <div className="flex w-full max-w-[420px] flex-col items-center">
          <img src={logoIcon} alt={APP_NAME} className="mb-6 size-10" />
          <Card className="w-full p-6">{children}</Card>
        </div>
      </div>

      <div className="dark auth-ground text-foreground relative flex flex-1 items-center px-10 py-16 lg:min-h-screen">
        <div className="mx-auto flex w-full max-w-[380px] flex-col gap-6">
          <h2 className="text-3xl font-bold tracking-tight text-balance">
            Run your whole operation from one console.
          </h2>
          <ul className="flex flex-col gap-4">
            {BULLETS.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-sm">
                <CircleCheck className="text-primary mt-0.5 size-4 shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
