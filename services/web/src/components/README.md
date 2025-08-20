# Web Components

Helper components designed to simplify and quickly iterate on layouts.

- [Search Provider](#search-provider)
- [Filters](#filters)
- [Links](#links)

## Search Provider

Component that leverages render props to simplify loading tables or lists with
pagination. Basic Usage:

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

### Props

- `children` A function that renders the list or table. Takes a single argument
  that provides the following:
  - `items` The result provided from `onDataNeeded`
  - `reload` A function that reloads the data set.
  - `setSort` Sets the currently sorted field. If already sorting on that field
    flips the `order` flag.
  - `getSorted` Returns either `ascending` or `descending`.
  - `setFilters` Sets the currently sorted filters.
  - `filters` Current applied filters.
  - `loading` True when fetching data. Useful for manually handling loaders.
  - `error` An error object when an error occurs.
  - `page`: The current page. Useful when manually handling pagination.
  - `sort` The current sorting. Useful when manually handling pagination. Object
    composed of:
    - `field` Field to sort on.
    - `order` Order to be applied. Can be `asc` (default) or `desc`.
- `onDataNeeded` An async function that fetches data. Called on mount, on
  setting filters, sort, etc.
- `limit` The default search limit.
- `page` The default page.
- `sort` The default sort. An object composed of:
  - `field` Field to sort on.
  - `order` Order to be applied. Can be `asc` (default) or `desc`.
- `loader` Boolean allowing `SearchProvider` to show a loader. Default is
  `true`.
- `pagination`: Boolean allowing `SearchProvider` to show a pagination
  component. Default is `true`.

## Filters

A modal that allows filters to be used in conjunction with `SearchProvider`.
Usage:

```jsx
<Filters onSave={setFilters} filters={filters}>
  <Filters.Text name="name" label="Name" />
  <Filters.Number name="name" label="Name" />
  <Filters.Dropdown label="Country" name="country" options={countries} search />
</Filters>
```

### Props:

- `onSave` A function called when filters are saved.
- `filters` An arbitrary object describing currently applied filters.

## Links

Link helpers handle the complexities of external linking and browser
discrepancies:

- `ExternalLink` - External links that open in a new tab. Takes a single `href`
  prop.
- `MailLink` - Links to an external email application. Takes a single `mail`
  prop.
- `TelLink` - Links to an external phone application. Takes a single `tel` prop.
- `ContentLink` - Catch-all helper when link type is unknown. Takes a single
  `href` prop. Falls back to router when link is relative.
