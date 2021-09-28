import React from 'react';
// import { Button, Progress } from 'semantic';
import bem from 'helpers/bem';

// import Chapters from './Chapters';
import ShakaPlayer from 'shaka-player-react';
import 'shaka-player/dist/controls.css';

@bem
export default class GCloudPlayer extends React.Component {
  render() {
    return (
      <ShakaPlayer
        autoPlay
        src="https://storage.googleapis.com/wqet-staging-transcoded-videos/manifest.mpd"
      />
    );
  }
}
