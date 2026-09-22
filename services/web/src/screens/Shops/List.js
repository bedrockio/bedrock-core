import { Link } from '@bedrockio/router';

import ErrorMessage from 'components/ErrorMessage';
import ListStats from 'components/ListStats';
import ListToolbar from 'components/ListToolbar';
import PageHeader from 'components/PageHeader';
import Protected from 'components/Protected';
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
import allCountries from 'utils/countries';
import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';

import Actions from './Actions';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  label: nameEn,
  key: countryCode,
}));

export default function ShopList() {
  async function onDataNeeded(body) {
    return await request({
      method: 'POST',
      path: '/1/shops/search',
      body,
    });
  }

  async function fetchOwners(props) {
    const { data } = await request({
      method: 'POST',
      path: '/1/users/search',
      body: props,
    });
    return data;
  }

  async function fetchCategories(props) {
    const { data } = await request({
      method: 'POST',
      path: '/1/categories/search',
      body: props,
    });
    return data;
  }

  return (
    <Search.Provider onDataNeeded={onDataNeeded}>
      {({ items: shops, reload, error }) => {
        return (
          <div className="flex flex-col gap-4">
            <PageHeader
              title="Shops"
              breadcrumbItems={[
                { href: '/', title: 'Home' },
                { title: 'Shops' },
              ]}
              rightSection={
                <>
                  <Search.Export filename="shops" />
                  <Protected endpoint="shops" permission="create">
                    <Button asChild>
                      <Link to="/shops/new">New Shop</Link>
                    </Button>
                  </Protected>
                </>
              }
            />

            <ListStats resource="shops" label="Shops" />

            <ListToolbar>
              <SearchFilters.Select
                data={countries}
                search
                name="country"
                label="Country"
              />
              <SearchFilters.Select
                search
                onDataNeeded={fetchOwners}
                name="owner"
                label="Owner"
              />
              <SearchFilters.Select
                search
                multiple
                onDataNeeded={fetchCategories}
                name="categories"
                label="Categories"
              />
              <SearchFilters.DateRange label="Created At" name="createdAt" />
            </ListToolbar>

            <ErrorMessage error={error} />

            <Table>
              <TableHeader>
                <TableRow>
                  <Search.Header name="name">Name</Search.Header>
                  <Search.Header width={60}>Image</Search.Header>
                  <Search.Header name="createdAt" width={280}>
                    Created
                  </Search.Header>
                  <Search.Header width={100} className="text-center">
                    Actions
                  </Search.Header>
                </TableRow>
              </TableHeader>
              <TableBody>
                <Search.Loading columns={5} />
                <Search.EmptyMessage>
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="text-muted-foreground flex flex-col items-center gap-1 py-12 text-center">
                        <p className="text-foreground font-semibold">
                          No shops yet
                        </p>
                        <p className="text-sm">
                          Create your first shop to get started.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                </Search.EmptyMessage>
                {shops.map((shop) => {
                  return (
                    <TableRow key={shop.id}>
                      <TableCell>
                        <Link
                          className="text-foreground no-underline hover:underline"
                          to={`/shops/${shop.id}`}>
                          {shop.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {shop.images.length > 0 && (
                          <Thumbnail
                            className="size-10"
                            src={urlForUpload(shop.images[0], true)}
                            alt={shop.name}
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {formatDateTime(shop.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Actions
                            compact
                            shop={shop}
                            reload={reload}
                            displayMode="list"
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
