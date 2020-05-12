This folder contains some small scripts to optimize assets for the web.

- `build-adaptive-video` Creates an [mpeg-dash](https://bitmovin.com/video-bitrate-streaming-hls-dash/) video that can be streamed. Requires ffmpeg and gcloud.
- `crop-video` Crops a video. Requires ffmpeg.
- `make-video-sprite`. Pulls down video frames and makes a spritesheet. Intended for iOS where inline video cannot autoplay without user interaction. Requires ffmpeg and imagemagick.
- `optimize-video` Optimizes a video for web. Firefox and Safari specifically often have issues with H264 encoded videos without specific settings. This scripts helps smooth that out. Requires ffmpeg.
- `pad-image` Convenience script to pad an image to be certain size, optionally with a background color. Requires imagemagick.