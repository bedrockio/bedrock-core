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
        <p className="text-base leading-normal">{product.description}</p>
        <h2 className="text-xl font-bold tracking-tight">Images</h2>
        <div className="flex flex-wrap items-center gap-2">
          {product.images.map((image) => (
            <Thumbnail
              key={image}
              src={urlForUpload(image)}
              className="h-[200px] w-[300px]"
            />
          ))}
        </div>

        <DefinitionList className="mt-4">
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
