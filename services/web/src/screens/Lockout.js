import { Link, useNavigate } from '@bedrockio/router';
import { Clock } from 'lucide-react';
import { useEffect } from 'react';

import { useSession } from 'stores/session';

import Meta from 'components/Meta';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { APP_NAME } from 'utils/env';

import logoIcon from 'assets/logo-icon.svg';

function Lockout() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useSession();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="auth-ground relative flex min-h-screen w-full flex-col items-center justify-center gap-6 px-4 py-16">
      <Meta title="Lockout" />
      <img src={logoIcon} alt={APP_NAME} className="size-10" />
      <Card className="flex w-full max-w-sm flex-col items-center gap-4 p-8 text-center">
        <div className="bg-info/10 text-info grid size-14 place-items-center rounded-2xl">
          <Clock className="size-7" strokeWidth={1.75} />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-xl font-bold tracking-tight">
            Pending approval
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            An administrator needs to assign your role before you can access
            the dashboard.
          </p>
        </div>
        {user?.email && (
          <p className="text-muted-foreground text-xs">
            Signed in as{' '}
            <span className="text-foreground font-medium">{user.email}</span>
          </p>
        )}
        <Separator />
        <Button asChild className="w-full">
          <Link to="/logout">Logout</Link>
        </Button>
      </Card>
    </div>
  );
}

export default Lockout;
