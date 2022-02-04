# <APP_NAME> API v1

The <APP_NAME> API is a RESTful JSON API. Select export CSV API calls are available for specific endpoints. All communication is enforced over HTTPS (with support for TLS 1.3) and protected by CloudFlare. Using the dashboard API credentials can be managed with a full RBAC permissioning layer.

### URLs

Main production URL:

```
<API_URL>/
```

### API Key

Each client using using the api must provide use an API key to identify itself.
You can provide your API key via an header (`APIKey: <apiKey>`):

```bash
curl -H 'APIKey: <apiKey>' <API_URL>/
```

### Authorization

JWT is used for all authentication. You can provide your API token in a standard bearer token request (`Authorization: Bearer <token>`) like so:

```bash
curl -H 'Authorization: Bearer <token>' <API_URL>/
```

_When receiving a 401 status code, the client should clear any stored JWT tokens - this will enable authentication reset and expiry behavior_

### Requests

A pragmatic RESTful style is enforced on all API calls. GET requests are only used to obtain objects.

Search/List API calls are done using POST to allow reliable JSON parameters. Example search:

```bash
curl -XPOST <API_URL>/1/users/search \
  -d '{"limit": 100, "skip": 0}' \
  -H 'Authorization: Bearer <token>' \
  -H 'APIKey: <apikey>' \
  -H 'Content-Type: application/json'
```

### Responses

A standard successful response envelope has a `data` attribute containing the result. An optional `meta` response can be given to provide supplementary information such as pagination information:

```json
{
  "data": [{}],
  "meta": {
    "total": 45367,
    "skip": 0,
    "limit": 100
  }
}
```

Mutation operations (PATCH and DELETE) may contain a `success` boolean in the response.

### Errors

Errors are returned as follows:

```json
{
  "error": {
    "message": "\"userId\" needs to be a valid ID"
  }
}
```

An additional `details` array is added for validation errors to specify which fields had errors:

```json
{
  "error": {
    "message": "\"userId\" needs to be a valid ID",
    "details": [
      {
        "message": "\"userId\" needs to be a valid ID",
        "path": ["userId"],
        "type": "string.invalidID",
        "context": {
          "value": "INVALID",
          "key": "userId",
          "label": "userId"
        }
      }
    ]
  }
}
```
