## Web Utils

These helper functions are available to do common UI patterns on top of these libraries:

- [Lodash](https://lodash.com/docs/4.17.15) - General Purpose Utils
- [Luxon](https://moment.github.io/luxon/) - Low-footprint Data Library

## API

In order to do API calls, use the API utility:

```javascript
import { request } from 'utils/api';

try {
  const { data } = await request({
    method: 'POST',
    path: '/1/users/search',
    body: {},
  });
} catch (err) {}
```

## Env / Configuration

Any environment variables can be passed from `.env`, a Docker container or the `serve.js` process. These can be explicitly exposed in [./env.js](./env.js). This is how they can be accessed anywhere in the code:

```javascript
import { API_URL } from 'utils/env';
```

## Date

Convert a data object or ISO string to a human readable date time:

```javascript
import { formatDateTime } from 'utils/date';
formatDateTime(new Date());
```

Or a date object:

```javascript
import { formatDate } from 'utils/date';
formatDate(new Date());
```

## Formatting

Truncate texts using:

```javascript
import { truncate } from 'utils/formatting';
truncate(myLongText, 100);
```

Format a large number with commas:

```javascript
import { numberWithCommas } from 'utils/formatting';
numberWithCommas(1000000);
```

Format a large number with periods (European):

```javascript
import { numberWithDots } from 'utils/formatting';
numberWithDots(1000000);
```

Round a number to three decimal places (safe way):

```javascript
import { round } from 'utils/formatting';
round(0.232837827873, 3);
```

Format US Dollar amount:

```javascript
import { formatUsd } from 'utils/formatting';
formatUsd(99.999999); // $99.99
```

## Uploads

To get the URL for an Upload Object coming from the API:

```javascript
import { urlForUpload } from 'utils/uploads';

urlForUpload(uploadObject);
```
