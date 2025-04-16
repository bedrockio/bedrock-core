## Web Utils

These helper functions are available to do common UI patterns on top of these
libraries:

- [Lodash](https://lodash.com/docs) - General Purpose Utils
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

Any environment variables can be passed from `.env`, a Docker container or the
`serve.js` process. These can be explicitly exposed in [./env.js](./env.js).
This is how they can be accessed anywhere in the code:

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

Format a number:

```javascript
import { formatNumber } from 'utils/formatting';
formatNumber(1000000); // Default formatting for browser locale
formatNumber(1000000, 'en'); // -> 1,000,000
formatNumber(1000000, 'nl'); // -> 1.000.000
```

Round a number to three decimal places (safe way):

```javascript
import { round } from 'utils/formatting';
round(0.232837827873, 3);
```

Format US Dollar amount:

```javascript
import { formatUsd } from 'utils/currency';
formatUsd(99.999999); // $99.99
```

Format an `address` object:

```javascript
formatAddress(shop.address);
```

## Forms

Quickly create a bunch of options for Dropdown (and Label) from a hash:

```javascript
import { createDropdownOptions } from 'utils/forms';

export const statuses = {
  pending: {
    name: 'Pending',
    icon: 'wait',
  },
  scheduled: {
    name: 'Scheduled',
    icon: 'checkmark',
    color: 'olive',
  },
  cancelled: {
    name: 'Cancelled',
    icon: 'dont',
    color: 'red',
  },
};

export const statusOptions = createDropdownOptions(statuses); // [{key: 'pending', 'icon': 'wait', ...}]
```

```javascript
import { createDropdownOptions } from 'utils/forms';

const options = createDropdownOptions(['pending', 'scheduled', 'cancelled']);
```

## Uploads

To get the URL for an Upload Object coming from the API:

```javascript
import { urlForUpload } from 'utils/uploads';

urlForUpload(uploadObject);
```
