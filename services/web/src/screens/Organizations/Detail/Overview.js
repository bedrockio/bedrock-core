import { usePage } from 'stores/page';

import {
  DefinitionItem,
  DefinitionList,
} from '@/components/ui/definition-list';

import { formatDateTime } from 'utils/date';

import Menu from './Menu';

export default function ShopOverview() {
  const { organization } = usePage();
  return (
    <>
      <Menu />

      <div className="mt-4 flex flex-col gap-4">
        <p className="text-base">{organization.name}</p>
        <DefinitionList className="mt-4">
          <DefinitionItem label="Created At">
            {formatDateTime(organization.createdAt)}
          </DefinitionItem>
          <DefinitionItem label="Updated At">
            {formatDateTime(organization.updatedAt)}
          </DefinitionItem>
        </DefinitionList>
      </div>
    </>
  );
}
