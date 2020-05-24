# Bedrock Components

Bedrock has a number of helper components designed to simplify and quickly iterate on layouts.

- [Links](#links)
- [Layout](#layout)

## Links

Link helpers handle the complexities of external linking and browser discrepancies:

- `ExternalLink` - External links that open in a new tab. Takes a single `href` prop.
- `MailLink` - Links to an external email application. Takes a single `mail` prop.
- `TelLink` - Links to an external phone application. Takes a single `tel` prop.
- `ContentLink` - Catch-all helper when link type is unknown. Takes a single `href` prop. Falls back to `react-router-dom` when link is relative.

## Layout

A layout helper that wraps simple flexbox layouts. Component that wraps simple flexbox layouts:

- Simple horizontal layout that aligns its children vertically center:

```jsx
<Layout horizontal center>
  <el />
  <el />
</Layout>
// applies:
// display: flex;
// flex-flow: row;
// align-items: center;
```

- A horizontal spread layout that pushes children to their edges:

```jsx
<Layout horizontal center spread>
  <el />
  <el />
</Layout>
// applies:
// display: flex;
// flex-flow: row;
// align-items: center;
// justify-content: space-between;
```

- A perfectly centered layout that aligns both vertically and horizontally center:

```jsx
<Layout center>
  <el />
</Layout>
// applies:
// display: flex;
// align-items: center;
// justify-content: center;
```

- Other layout patterns can be achieved by mixing vertical and horizontal props:

```jsx
<Layout horizontal top />
<Layout horizontal center />
<Layout horizontal bottom />
<Layout vertical left />
<Layout vertical center />
<Layout vertical right />
```

- Grouping content:

```jsx
<Layout center>
  <Layout.Group>
    <el />
    <el />
  </Layout.Group>
  <Layout.Group>
    <el />
    <el />
  </Layout.Group>
</Layout>
```

- Other props:

  - `stackable` - Like semantic UI stacks on mobile.
  - `wrap` - Allows wrapping of content.
  - `stretch` - Applied align-items: stretch (children grow vertically or horizontally).
  - `padded` - Applies padding between items.
  - `extra padded` - Applies extra padding.
  - `baseline` - Applies align-items: baseline.
  - `reversed` - Layouts can be reversed.
