import { PiTrash } from 'react-icons/pi';

import { useSession } from 'stores/session';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getToken, useRequest } from 'utils/api';
import countries from 'utils/countries';
import { fromNow } from 'utils/date';
import { notify } from 'utils/notify';
import { parseToken } from 'utils/token';
import { parseUserAgent } from 'utils/user-agent';

export default function Sessions() {
  const { user, bootstrap } = useSession();

  const { jti } = parseToken(getToken());

  const logoutRequest = useRequest({
    method: 'POST',
    path: '/1/auth/logout',
    onSuccess: () => {
      bootstrap();
    },
    onError: () => {
      notify({
        position: 'top-right',
        title: 'Error',
        message: 'Failed to logout session(s)',
        color: 'red',
      });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device/Browser</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {user.authTokens.map((token) => {
            const country = countries.find(
              (country) => country.countryCode === token.country,
            );

            const { device, os, browser } = parseUserAgent(token.userAgent);

            return (
              <TableRow key={token.jti}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      title={`Device: ${device}\nOS: ${os}\nBrowser: ${browser}`}
                      className="text-sm">
                      {[os, browser].join(' - ')}
                    </span>

                    {token.jti === jti && (
                      <Badge variant="outline">Current</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell title={`IP: ${token.ip}`}>
                  {country?.nameEn || 'N/A'}
                </TableCell>
                <TableCell>{fromNow(token.lastUsedAt)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Logout"
                    disabled={logoutRequest.loading}
                    onClick={() =>
                      logoutRequest.request({ body: { jti: token.jti } })
                    }>
                    <PiTrash className="text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Separator />
      <div className="flex">
        <Button
          variant="destructive"
          disabled={logoutRequest.loading}
          onClick={() => logoutRequest.request({ body: { all: true } })}>
          Logout All Sessions
        </Button>
      </div>
    </div>
  );
}
