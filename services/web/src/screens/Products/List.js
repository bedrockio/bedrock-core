import { Link } from '@bedrockio/router';

import ErrorMessage from 'components/ErrorMessage';
import PageHeader from 'components/PageHeader';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';
import Thumbnail from 'components/Thumbnail';

import { Button } from '@/components/ui/button';
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

import Actions from './Actions';

export default function ProductList() {
  async function onDataNeeded(body) {
    return await request({
      method: 'POST',
      path: '/1/products/search',
      body,
    });
  }

  return (
    <Search.Provider onDataNeeded={onDataNeeded}>
      {({ items: products, reload, error }) => {
        return (
          <div className="flex flex-col gap-4">
            <PageHeader
              title="Products"
              breadcrumbItems={[
                { href: '/', title: 'Home' },
                { title: 'Products' },
              ]}
              rightSection={
                <>
                  <Search.Export filename="products" />
                  <Button asChild>
                    <Link to="/products/new">New Product</Link>
                  </Button>
                </>
              }
            />

            <div className="flex items-center justify-between gap-4">
              <SearchFilters.Modal>
                <SearchFilters.Checkbox name="isFeatured" label="Is Featured" />
                <SearchFilters.Number name="priceUsd" label="Price Usd" />
                <SearchFilters.DateRange
                  time
                  name="expiresAt"
                  label="Expires At"
                />
                <SearchFilters.DateRange
                  time
                  name="createdAt"
                  label="Created At"
                />
              </SearchFilters.Modal>

              <div className="flex items-center gap-4">
                <Search.Status />
                <SearchFilters.Keyword />
              </div>
            </div>

            <ErrorMessage error={error} />

            <Table>
              <TableHeader>
                <TableRow>
                  <Search.Header name="name">Name</Search.Header>
                  <Search.Header width={60}>Image</Search.Header>
                  <Search.Header name="priceUsd">Price</Search.Header>
                  <Search.Header name="createdAt" width={280}>
                    Created
                  </Search.Header>
                  <Search.Header className="text-center">Actions</Search.Header>
                </TableRow>
              </TableHeader>
              <TableBody>
                <Search.EmptyMessage>
                  <TableRow>
                    <TableCell colSpan={5}>
                      <p className="py-4 text-center font-bold">
                        No products found.
                      </p>
                    </TableCell>
                  </TableRow>
                </Search.EmptyMessage>
                {products.map((product) => {
                  const [image] = product.images;
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Link
                          className="text-foreground no-underline hover:underline"
                          to={`/products/${product.id}`}>
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {image && (
                          <Thumbnail
                            className="size-10"
                            src={urlForUpload(image, true)}
                            alt={product.name}
                          />
                        )}
                      </TableCell>
                      <TableCell>{formatUsd(product.priceUsd)}</TableCell>
                      <TableCell>{formatDateTime(product.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Actions
                            displayMode="list"
                            product={product}
                            reload={reload}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Search.Pagination />
          </div>
        );
      }}
    </Search.Provider>
  );
}
