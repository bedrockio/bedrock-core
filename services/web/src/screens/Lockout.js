import { Link, useNavigate } from '@bedrockio/router';
import { useEffect } from 'react';

import { useSession } from 'stores/session';

import Meta from 'components/Meta';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function Lockout() {
  const navigate = useNavigate();
  const { isLoggedIn } = useSession();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Meta title="Lockout" />
      <Card>
        <CardContent className="flex flex-col gap-4">
          <p>
            Your account is pending approval. Please wait for an administrator
            to assign the necessary permissions/roles before you can access the
            dashboard.
          </p>
          <div className="flex justify-end">
            <Button asChild>
              <Link to="/logout">Logout</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Lockout;
