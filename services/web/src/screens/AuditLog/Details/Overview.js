import { Link } from '@bedrockio/router';

import Code from 'components/Code';

import { Card, CardContent } from '@/components/ui/card';
import {
  DefinitionItem,
  DefinitionList,
} from '@/components/ui/definition-list';
import { Separator } from '@/components/ui/separator';

import { formatDateTime } from 'utils/date';

export default function Overview({ auditEntry }) {
  if (!auditEntry) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-bold">Details</p>
        <DefinitionList>
          <DefinitionItem label="Activity">
            {auditEntry.activity}
          </DefinitionItem>
          <DefinitionItem label="Actor">
            <Link
              className="text-primary hover:underline"
              title={auditEntry.actor.email}
              to={`/users/${auditEntry.actor.id}`}>
              {auditEntry.actor.firstName} {auditEntry.actor.lastName}
            </Link>
          </DefinitionItem>
          {auditEntry.objectType && (
            <DefinitionItem label="Object Type">
              {auditEntry.objectType}
            </DefinitionItem>
          )}
          {auditEntry.objectId && (
            <DefinitionItem label="Object Id">
              {auditEntry.objectId}
            </DefinitionItem>
          )}
          {auditEntry?.owner?.name && (
            <DefinitionItem label="Object Owner">
              <Link
                className="text-primary hover:underline"
                title={auditEntry.owner.name}
                to={`/users/${auditEntry.owner.id}`}>
                {auditEntry.owner.name}
              </Link>{' '}
              - {auditEntry.ownerType}
            </DefinitionItem>
          )}
          <DefinitionItem label="Method">
            {auditEntry.requestMethod}
          </DefinitionItem>
          <DefinitionItem label="Path">
            {auditEntry.requestUrl}
          </DefinitionItem>
          {auditEntry.sessionId && (
            <DefinitionItem label="Session Id">
              {auditEntry.sessionId}
            </DefinitionItem>
          )}
          <DefinitionItem label="Created At">
            {formatDateTime(auditEntry.createdAt)}
          </DefinitionItem>
        </DefinitionList>
      </div>

      {auditEntry.attributes && (
        <>
          <Separator />
          <Card>
            <CardContent>
              <p className="mb-2 text-sm font-bold">Attributes</p>
              <Code language="json">
                {JSON.stringify(auditEntry.attributes || {}, null, 2)}
              </Code>
            </CardContent>
          </Card>
        </>
      )}

      {auditEntry.objectBefore && (
        <>
          <Separator />
          <Card>
            <CardContent>
              <p className="mb-2 text-sm font-bold">Before</p>
              <Code language="json">
                {JSON.stringify(auditEntry.objectBefore || {}, null, 2)}
              </Code>
            </CardContent>
          </Card>
        </>
      )}
      {auditEntry.objectAfter && (
        <>
          <Separator />
          <Card>
            <CardContent>
              <p className="mb-2 text-sm font-bold">After</p>
              <Code language="json">
                {JSON.stringify(auditEntry.objectAfter || {}, null, 2)}
              </Code>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
