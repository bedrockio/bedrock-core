# Uploads API

This API provides binary upload and download capabilities. Each uploaded object has a `hash` attribute that allows read-only permissions to anyone using that key.

## Upload Object

Meta-data associated with a binary file upload.

<%= objectSummary({name: 'Upload'}) %>

## Create Upload

Upload a new file. Requires an authenticated user.

<%= callHeading({method: 'POST', path: '/1/uploads'}) %>

The request format for this call is multipart form data. The server expects a form field named `file` that contains the uploaded file. Arrays are supported too.

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

<%= callResponse({method: 'POST', path: '/1/uploads'}) %>

## Download Uploaded File

Obtain binary file by secret hash. This can result in a binary response with the uploaded mime type, or, if a cloud bucket storage engine is used, the response can be a redirect to the bucket storage CDN.

<%= callSummary({method: 'GET', path: '/1/uploads/:hash/image'}) %>

## Get Upload

Obtain upload meta data by using the secret content `hash`.

<%= callSummary({method: 'GET', path: '/1/uploads/:hash'}) %>

## Delete Upload

Delete upload by ID. Requires ownership of upload.

<%= callSummary({method: 'DELETE', path: '/1/uploads/:uploadId'}) %>
