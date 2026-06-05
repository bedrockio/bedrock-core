import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import ErrorMessage from 'components/ErrorMessage';
import SearchDropdown from 'components/SearchDropdown';
import CurrencyField from 'components/form-fields/Currency';
import DateTimeField from 'components/form-fields/DateTime';
import TagsField from 'components/form-fields/Tags';
import UploadsField from 'components/form-fields/Uploads';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import { useRequest } from 'utils/api';
import { notifySuccess } from 'utils/notify';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isFeatured: z.boolean().optional(),
  priceUsd: z.union([z.number(), z.string()]).nullable().optional(),
  expiresAt: z.any().nullable().optional(),
  sellingPoints: z.array(z.string()).optional(),
  images: z.array(z.any()).optional(),
  shop: z.any().nullable().optional(),
});

function getDefaultValues(product, shop) {
  if (product) {
    return {
      ...product,
      expiresAt: product.expiresAt ? new Date(product.expiresAt) : null,
    };
  }
  return {
    name: '',
    description: '',
    isFeatured: false,
    priceUsd: '',
    expiresAt: null,
    sellingPoints: [],
    images: [],
    shop: shop || null,
  };
}

export default function ProductForm({ product, shop, onSuccess = () => {} }) {
  const isUpdate = !!product;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(product, shop),
  });

  const [uploadError, setUploadError] = useState(null);

  const editRequest = useRequest({
    ...(isUpdate
      ? {
          method: 'PATCH',
          path: `/1/products/${product.id}`,
        }
      : {
          method: 'POST',
          path: '/1/products',
          body: {
            shop: shop?.id || form.getValues('shop')?.id,
          },
        }),
    onSuccess: ({ data }) => {
      notifySuccess({
        title: isUpdate
          ? `${form.getValues('name')} was successfully updated.`
          : `${form.getValues('name')} was successfully created.`,
      });
      setTimeout(() => {
        onSuccess(data);
      }, 200);
    },
  });

  async function onSubmit(values) {
    setUploadError(null);
    await editRequest.request({ body: values });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Is Featured</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceUsd"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CurrencyField
                        name="priceUsd"
                        label="Price"
                        currency="USD"
                        value={field.value}
                        onChange={({ value }) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DateTimeField
                        name="expiresAt"
                        label="Expires At"
                        value={field.value}
                        onChange={(name, value) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sellingPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TagsField
                        name="sellingPoints"
                        label="Selling Points"
                        value={field.value || []}
                        onChange={({ value }) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!shop && (
                <FormField
                  control={form.control}
                  name="shop"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SearchDropdown
                          clearable
                          required
                          name="shop"
                          label="Shop"
                          searchPath="/1/shops/search"
                          placeholder="Search Shops"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <UploadsField
                        name="images"
                        label="Images"
                        value={field.value || []}
                        onChange={(name, value) => field.onChange(value)}
                        onError={(error) => setUploadError(error)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
        <ErrorMessage error={uploadError || editRequest?.error} />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Spinner />}
            {isUpdate ? 'Update' : 'Create'} Product
          </Button>
        </div>
      </form>
    </Form>
  );
}
