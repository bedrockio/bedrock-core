import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import ErrorMessage from 'components/ErrorMessage';
import SearchDropdown from 'components/SearchDropdown';
import UploadsField from 'components/form-fields/Uploads';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import { useRequest } from 'utils/api';
import allCountries from 'utils/countries';
import { notify } from 'utils/notify';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  label: nameEn,
  key: countryCode,
}));

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  categories: z.array(z.any()).optional(),
  images: z.array(z.any()).optional(),
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    countryCode: z.string().optional(),
  }),
});

export default function ShopForm({ shop, onSuccess = () => {} }) {
  const isUpdate = !!shop;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: shop || {
      name: '',
      description: '',
      categories: [],
      images: [],
      address: {
        line1: '',
        line2: '',
        city: '',
        countryCode: '',
      },
    },
  });

  const editRequest = useRequest({
    ...(isUpdate
      ? {
          method: 'PATCH',
          path: `/1/shops/${shop.id}`,
        }
      : {
          method: 'POST',
          path: '/1/shops',
        }),
    onSuccess: ({ data }) => {
      notify({
        title: isUpdate
          ? `${data.name} was successfully updated.`
          : `${data.name} was successfully created.`,
        color: 'green',
      });
      setTimeout(() => {
        onSuccess(data);
      }, 200);
    },
  });

  async function onSubmit(values) {
    await editRequest.request({ body: values });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Shop Details</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Name<span className="text-destructive"> *</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categories"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SearchDropdown
                            multiple
                            searchPath="/1/categories/search"
                            label="Categories"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <FormField
                    control={form.control}
                    name="address.line1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.line2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Town</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.countryCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem
                                key={country.key}
                                value={country.value}>
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <UploadsField
                          name="images"
                          value={field.value}
                          onChange={(...args) => {
                            // UploadsField calls onChange either as
                            // (name, value) on upload or ({ name, value })
                            // on remove. Normalize to the new value.
                            if (args.length > 1) {
                              field.onChange(args[1]);
                            } else {
                              field.onChange(args[0]?.value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          <ErrorMessage error={editRequest.error} className="mb-4" />
          <div className="mt-4 flex items-center gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Spinner className="text-current" />
              )}
              {isUpdate ? 'Update' : 'Create New'} Shop
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
