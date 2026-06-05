import { Link } from '@bedrockio/router';

import { usePage } from 'stores/page';

import ErrorMessage from 'components/ErrorMessage';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';
import Thumbnail from 'components/Thumbnail';
import Actions from 'screens/Products/Actions';

import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { request } from 'utils/api';
import { formatUsd } from 'utils/currency';
import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';

import Menu from './Menu';

export default function ShopProducts() {
  const { shop } = usePage();

  async function onDataNeeded(params) {
    return await request({
      method: 'POST',
      path: '/1/products/search',
      body: {
        ...params,
        shop: shop.id,
      },
    });
  }

  return (
    <>
      <Menu />

      <Search.Provider onDataNeeded={onDataNeeded}>
        {({ items: products, reload, loading, error }) => {
          return (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {loading && <Spinner />}
                </div>
                <div className="flex items-center gap-2">
                  <Search.Status />
                  <SearchFilters.Keyword />
                </div>
              </div>

              <ErrorMessage error={error} />

              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <Search.Header name="name">Name</Search.Header>
                    <Search.Header width={60}>Image</Search.Header>
                    <Search.Header name="priceUsd">Price</Search.Header>
                    <Search.Header name="createdAt" width={280}>
                      Created
                    </Search.Header>
                    <Search.Header width={120}>Actions</Search.Header>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <Search.EmptyMessage>
                    <TableRow>
                      <TableCell colSpan={5}>
                        <p className="p-4 text-center font-bold">
                          No products found.
                        </p>
                      </TableCell>
                    </TableRow>
                  </Search.EmptyMessage>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Link
                          className="text-foreground no-underline hover:underline"
                          to={`/products/${product.id}`}>
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Thumbnail
                          className="size-10"
                          src={urlForUpload(product.images[0])}
                          alt={product.name}
                        />
                      </TableCell>
                      <TableCell>{formatUsd(product.priceUsd)}</TableCell>
                      <TableCell>{formatDateTime(product.createdAt)}</TableCell>
                      <TableCell className="text-center">
                        <Actions compact product={product} reload={reload} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Search.Pagination />
            </div>
          );
        }}
      </Search.Provider>
    </>
  );
}
