import { usePage } from 'stores/page';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DefinitionItem,
  DefinitionList,
} from '@/components/ui/definition-list';

import { formatDateTime } from 'utils/date';

import Menu from './Menu';

export default function Overview() {
  const { template } = usePage();
  return (
    <>
      <Menu />
      <div className="mt-4 flex flex-col gap-4">
        <Card>
          <CardContent>
            <DefinitionList>
              <DefinitionItem label="Channels">
                <div className="flex flex-wrap items-center gap-2">
                  {template.channels.map((channel) => {
                    return (
                      <Badge key={channel} variant="secondary">
                        {channel}
                      </Badge>
                    );
                  })}
                </div>
              </DefinitionItem>
              <DefinitionItem label="Created At">
                {formatDateTime(template.createdAt)}
              </DefinitionItem>
              <DefinitionItem label="Updated At">
                {formatDateTime(template.updatedAt)}
              </DefinitionItem>
            </DefinitionList>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
