import { usePage } from 'stores/page';

import ArrayList from 'components/ArrayList';
import Thumbnail from 'components/Thumbnail';

import {
  DefinitionItem,
  DefinitionList,
} from '@/components/ui/definition-list';

import { formatCurrency } from 'utils/currency';
import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';

import Menu from './Menu';

export default function ShopOverview() {
  const { product } = usePage();
  return (
    <>
      <Menu />

      <div className="mt-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold tracking-tight">Images</h2>
        <div className="flex flex-wrap gap-4">
          {product.images.map((image) => (
            <div key={image} className="card-soft rounded-2xl p-1.5">
              <Thumbnail
                src={urlForUpload(image)}
                className="h-[200px] w-[300px] rounded-xl"
              />
            </div>
          ))}
        </div>

        <DefinitionList>
          <DefinitionItem label="Description">
            {product.description}
          </DefinitionItem>
          <DefinitionItem label="Price">
            {formatCurrency(product.priceUsd || 0, 'USD')}
          </DefinitionItem>
          <DefinitionItem label="Selling Points">
            <ArrayList array={product.sellingPoints} />
          </DefinitionItem>
          <DefinitionItem label="Created At">
            {formatDateTime(product.createdAt)}
          </DefinitionItem>
          <DefinitionItem label="Updated At">
            {formatDateTime(product.updatedAt)}
          </DefinitionItem>
        </DefinitionList>
      </div>
    </>
  );
}
