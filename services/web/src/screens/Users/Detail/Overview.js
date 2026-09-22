import { Link } from '@bedrockio/router';

import { usePage } from 'stores/page';

import Thumbnail from 'components/Thumbnail';
import UserImage from 'components/UserImage';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DefinitionItem,
  DefinitionList,
} from '@/components/ui/definition-list';
import { Separator } from '@/components/ui/separator';

import { useRequest } from 'utils/api';
import { formatDateTime } from 'utils/date';
import { formatRoles } from 'utils/permissions';
import { urlForUpload } from 'utils/uploads';

import Menu from './Menu';

export default function UserOverview() {
  const { user } = usePage();

  const shopsRequest = useRequest({
    method: 'POST',
    path: '/1/shops/search',
    body: {
      owner: user.id,
      limit: 3,
    },
  });

  return (
    <>
      <Menu />
      <UserImage user={user} />

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <DefinitionList>
              <DefinitionItem label="Name">{user.name}</DefinitionItem>
              <DefinitionItem label="Email">{user.email}</DefinitionItem>
              <DefinitionItem label="Roles">
                <div className="flex flex-wrap gap-1">
                  {formatRoles(user.roles).map((label) => {
                    return (
                      <Badge variant="secondary" key={label.key}>
                        <label.icon size={12} />
                        {label.content}
                      </Badge>
                    );
                  })}
                </div>
              </DefinitionItem>
              <DefinitionItem label="Phone">
                {user.phone || 'N / A'}
              </DefinitionItem>
              <DefinitionItem label="Created At">
                {formatDateTime(user.createdAt)}
              </DefinitionItem>
            </DefinitionList>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shops</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            {shopsRequest.data.length === 0 && (
              <p className="text-muted-foreground text-xs">No shops yet</p>
            )}
            {shopsRequest.data.map((shop, index) => {
              return (
                <div key={shop.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <Link
                    to={`/shops/${shop.id}`}
                    className="flex items-center gap-4 no-underline">
                    <Thumbnail
                      src={urlForUpload(shop.images[0])}
                      className="size-10"
                    />
                    <div className="flex flex-col">
                      <span className="text-primary font-bold">
                        {shop.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {shop.description}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
