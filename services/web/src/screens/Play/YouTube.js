import React from 'react';
import YouTube from 'react-youtube';
import { loadScript } from 'utils/script';

export default class YouTubePlayer extends React.Component {
  onReady = (...args) => {
    console.info('ready!', ...args);
  };

  render() {
    return (
      <YouTube
        videoId="TE3UyI-14pE"
        opts={{
          height: '390',
          width: '640',
          playerVars: {
            controls: 1,
            disablekb: 1,
            rel: 0,
            modestbranding: 1,
            origin: 'http://localhost:2200',
            // https://developers.google.com/youtube/player_parameters
            // autoplay: 1,
          },
        }}
        onReady={this.onReady}
      />
    );
  }
}
