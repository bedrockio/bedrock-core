import React from 'react';
import { debounce } from 'lodash';
import { Divider } from 'semantic';
import { screen } from 'helpers';
import Menu from './Menu';
import { urlForUpload } from 'utils/uploads';
import { loadScript } from 'utils/script';

import Thumbnails from './Thumbnails';

function getManifestUrl(video) {
  return `https://storage.googleapis.com/wqet-staging-transcoded-videos/${video.id}/manifest.mpd`;
}
const DASH_SDK_URL = 'http://cdn.dashjs.org/latest/dash.all.min.js';

async function loadDash() {
  await loadScript(DASH_SDK_URL);
}

import './player.less';

@screen
export default class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: null,
    };
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.loadVideo();
  }

  loadVideo = async () => {
    const { baseUrl } = this.props.video;
    await loadDash();
    /* global dashjs */
    const player = dashjs.MediaPlayer().create();
    player.initialize(this.ref.current, baseUrl + 'manifest.mpd', true);
  };

  getPlayer() {
    return this.ref.current;
  }

  onTimeUpdate = () => {
    const player = this.getPlayer();
    this.setState({
      currentTime: player.currentTime,
    });
  };

  onCanPlay = () => {
    const player = this.getPlayer();
    this.setState({
      currentTime: player.currentTime,
    });
  };

  onSeeking = () => {
    const player = this.getPlayer();
    this.setState({
      scrubbing: true,
      currentTime: player.currentTime,
    });
  };

  onSeeked = debounce(() => {
    this.setState({
      scrubbing: false,
    });
  }, 200);

  onDurationChange = () => {
    const player = this.getPlayer();
    this.setState({
      duration: player.duration,
    });
  };

  render() {
    const { duration, currentTime, scrubbing } = this.state;
    const { video } = this.props;
    return (
      <div className={this.getBlockClass()}>
        <Menu {...this.props} />
        <Divider hidden />
        <div className={this.getElementClass('real-player')}>
          <video
            ref={this.ref}
            onCanPlay={this.onCanPlay}
            onTimeUpdate={this.onTimeUpdate}
            onSeeked={this.onSeeked}
            onSeeking={this.onSeeking}
            onDurationChange={this.onDurationChange}
            controls
            style={{ width: '100%', display: 'block' }}
          />
          <div className={this.getElementClass('real-player-controls')}>
            <Thumbnails
              active={scrubbing}
              duration={duration}
              currentTime={currentTime}
              src={video.spriteSheets.large}
              width={128}
              height={72}
            />
          </div>
        </div>
      </div>
    );
  }
}
