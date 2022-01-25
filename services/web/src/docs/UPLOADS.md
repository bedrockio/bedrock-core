# Uploads API

This API provides binary upload and download capabilities. The `id` of an
uploaded object can be used to [serve](#serve-uploaded-file) uploaded assets.
Additionally, metadata on the uploaded object can be [retrieved](#get-upload).

## Upload Object

Meta-data associated with a binary file upload.

objectSummary({name: 'Upload'})

## Create Upload

Upload a new file. Requires an authenticated user.

callHeading({method: 'POST', path: '/1/uploads'})

The request format for this call is multipart form data. The server expects a
form field named `file` that contains the uploaded file. Arrays are supported
too.

Example multipart form request:

```
POST /1/uploads
Content-Type: multipart/form-data; boundary=---------------------------BOUNDARY283729

---------------------------BOUNDARY283729
Content-Disposition: form-data; name="file"; filename="avatar.png"
Content-Type: image/png

<Binary data in Base64>

---------------------------BOUNDARY283729
```

callResponse({method: 'POST', path: '/1/uploads'})

## Serve Uploaded File

Serves the raw binary file with appropriate headers (e.g. `Content-Type`). Will
issue a `302` redirect if a cloud bucket storage engine is used.

callSummary({method: 'GET', path: '/1/uploads/:id/raw'})

## Get Upload

Obtain upload meta data.

callSummary({method: 'GET', path: '/1/uploads/:id'})

## Delete Upload

Delete upload by ID. Requires ownership of upload.

callSummary({method: 'DELETE', path: '/1/uploads/:uploadId'})
