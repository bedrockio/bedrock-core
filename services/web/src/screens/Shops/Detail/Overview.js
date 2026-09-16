import { usePage } from 'stores/page';

import Thumbnail from 'components/Thumbnail';

import {
  DefinitionItem,
  DefinitionList,
} from '@/components/ui/definition-list';

import { formatDateTime } from 'utils/date';
import { formatAddress } from 'utils/formatting';
import { urlForUpload } from 'utils/uploads';

import Menu from './Menu';

export default function ShopOverview() {
  const { shop } = usePage();
  return (
    <>
      <Menu />

      <div className="mt-4 flex flex-col gap-4">
        <p className="text-base leading-normal">{shop.description}</p>
        <h2 className="text-xl font-bold tracking-tight">Images</h2>
        <div className="flex flex-wrap gap-4">
          {shop.images.map((image) => (
            <div key={image} className="card-soft rounded-2xl p-1.5">
              <Thumbnail
                className="w-[300px] rounded-xl"
                src={urlForUpload(image)}
              />
            </div>
          ))}
        </div>

        <DefinitionList className="mt-4">
          <DefinitionItem label="Categories">
            <ul>
              {shop.categories.map((category) => {
                return <li key={category.id}>{category.name}</li>;
              })}
            </ul>
          </DefinitionItem>
          <DefinitionItem label="Address">
            {formatAddress(shop.address)}
          </DefinitionItem>
          <DefinitionItem label="Created At">
            {formatDateTime(shop.createdAt)}
          </DefinitionItem>
          <DefinitionItem label="Updated At">
            {formatDateTime(shop.updatedAt)}
          </DefinitionItem>
        </DefinitionList>
      </div>
    </>
  );
}
