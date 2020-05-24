# Bedrock Components

Bedrock has a number of helper components designed to simplify and quickly iterate on layouts.

- [Search Provider](#search-provider)
- [Filters](#filters)

## Search Provider

Component that leverages render props to simplify loading tables or lists with pagination. Basic Usage:

```jsx

onDataNeeded = async () => {
  // Fetch data
}

<SearchProvider onDataNeeded={this.onDataNeeded}>
  {({ items }) => {
    return (
      // render table or list here.
    )
  }
</SearchProvider>
```

### Props:

- `children` A function that renders the list or table. Takes a single argument that provides the following:
  - `items` The result provided from `onDataNeeded`
  - `reload` A function that reloads the data set.
  - `setSort` Sets the currently sorted field. If already sorting on that field flips the `order` flag.
  - `getSorted` Returns either `ascending` or `descending`. For compatibility with Semantic UI.
  - `setFilters` Sets the currently sorted filters.
  - `filters` Current applied filters.
  - `loading` True when fetching data. Useful for manually handling loaders.
  - `error` An error object when an error occurs.
  - `page`: The current page. Useful when manually handling pagination.
  - `sort` The current sorting. Useful when manually handling pagination. Object composed of:
    - `field` Field to sort on.
    - `order` Order to be applied. Can be `asc` (default) or `desc`.
- `onDataNeeded` An async function that fetches data. Called on mount, on setting filters, sort, etc.
- `limit` The default search limit.
- `page` The default page.
- `sort` The default sort. An object composed of:
  - `field` Field to sort on.
  - `order` Order to be applied. Can be `asc` (default) or `desc`.
- `loader` Boolean allowing `SearchProvider` to show a loader. Default is `true`.
- `pagination`: Boolean allowing `SearchProvider` to show a pagination component. Default is `true`.

## Filters

A modal that allows filters to be used in conjunction with `SearchProvider`. Usage:

```jsx
<Filters
  onSave={setFilters}
  filters={filters}
  fields={[
    {
      text: 'Role',
      name: 'role',
      options: [
        {
          text: 'User',
          value: 'user',
        },
        {
          text: 'Admin',
          value: 'admin',
        },
      ],
    },
  ]}
/>
```

### Props:

- `onSave` A function called when filters are saved.
- `filters` An arbitrary object describing currently applied filters.
- `fields` An array of custom filters that are applied as dropdowns. Each filter is an object that takes the shape:
  - `text` The text to be displayed as the label of the field.
  - `name` The form name to be used.
  - `options` An array of options to be used in the dropdown. Options take `text`, `value`, and `key` as keys compatible with Semantic UI.
