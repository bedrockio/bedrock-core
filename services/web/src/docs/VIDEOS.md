# Videos API

This API allows you to manage Video objects.

## Video Object

Information about a Video.

objectSummary({name: 'Video'})

## Create Video

Create a new video object.

callSummary({method: 'POST', path: '/1/videos'})

## Get Video

Obtain video object by unique video ID.

callSummary({method: 'GET', path: '/1/videos/:videoId'})

## List and Search Videos

List videos and filter by certain attributes.

callSummary({method: 'POST', path: '/1/videos/search'})

## Update Video

Update video information by ID.

callSummary({method: 'PATCH', path: '/1/videos/:videoId'})

## Delete Video

Delete video by ID.

callSummary({method: 'DELETE', path: '/1/videos/:videoId'})
