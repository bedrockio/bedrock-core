import React from 'react';
import { debounce } from 'lodash';
import { Divider } from 'semantic';
import { screen } from 'helpers';
import Menu from './Menu';
import { loadScript } from 'utils/script';
import Hls from 'hls.js';

import Thumbnails from './Thumbnails';

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

  getUrl() {
    const { video } = this.props;
    if (video.provider === 'gcloud') {
      return video.baseUrl + 'manifest.mpd';
    } else if (video.provider === 'cloudflare') {
      return `https://videodelivery.net/${video.cloudflare_uid}/manifest/video.mpd`;
    } else if (video.provider === 'mux') {
      return `https://stream.mux.com/${video.muxPlaybackId}.m3u8?default_subtitles_lang=en`;
    }
  }

  loadVideo = async () => {
    const { video } = this.props;
    if (video.provider === 'mux') {
      await this.loadHls();
    } else {
      await this.loadDash();
    }
  };

  loadDash = async () => {
    const url = this.getUrl();
    await loadDash();
    /* global dashjs */
    const player = dashjs.MediaPlayer().create();
    player.initialize(this.ref.current, url, true);
  };

  loadHls = () => {
    const el = this.ref.current;
    const src = this.getUrl();
    if (el.canPlayType('application/vnd.apple.mpegurl')) {
      // Some browers (safari and ie edge) support HLS natively
      el.src = src;
    } else if (Hls.isSupported()) {
      // This will run in all other modern browsers
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(el);
    } else {
      console.error("This is a legacy browser that doesn't support MSE");
    }
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
    const { video } = this.props;
    return (
      <div className={this.getBlockClass()}>
        <Menu {...this.props} />
        <Divider hidden />
        <div className={this.getElementClass('real-player')}>
          {this.renderPlayer(video)}
        </div>
      </div>
    );
  }

  renderPlayer(video) {
    if (video.provider === 'gcloud') {
      return this.renderTranscoder(video);
    } else if (video.provider === 'cloudflare') {
      return this.renderCloudflare(video);
    } else if (video.provider === 'mux') {
      return this.renderMux(video);
    } else if (video.provider === 'vimeo') {
      return this.renderVimeo(video);
    }
  }

  renderCloudflare(video) {
    return (
      <React.Fragment>
        <h2>Thumbnail</h2>
        <img
          height="270"
          src={`https://videodelivery.net/${video.cloudflare_uid}/thumbnails/thumbnail.jpg?time=2s&height=270`}
        />
        <h2>Animated Thumbnail</h2>
        <img
          height="270"
          src={`https://videodelivery.net/${video.cloudflare_uid}/thumbnails/thumbnail.gif?height=270&duration=2s`}
        />
        <h2>Embedded Player</h2>
        <iframe
          src={`https://iframe.videodelivery.net/${video.cloudflare_uid}`}
          style={{ border: 'none' }}
          width="480"
          height="270"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
        />
        <h2>Custom Player</h2>
        <video
          height="270"
          ref={this.ref}
          onCanPlay={this.onCanPlay}
          onTimeUpdate={this.onTimeUpdate}
          onSeeked={this.onSeeked}
          onSeeking={this.onSeeking}
          onDurationChange={this.onDurationChange}
          controls
        />
      </React.Fragment>
    );
  }

  renderMux(video) {
    const { duration, currentTime, scrubbing } = this.state;
    return (
      <React.Fragment>
        <h2>Thumbnail</h2>
        <img
          height="270"
          src={`https://image.mux.com/${video.muxPlaybackId}/thumbnail.png?height=270&fit_mode=pad`}
        />
        <h2>Animated Thumbnail</h2>
        <img
          height="270"
          src={`https://image.mux.com/${video.muxPlaybackId}/animated.gif`}
        />
        <h2>Custom Player</h2>
        <video
          height="270"
          ref={this.ref}
          onCanPlay={this.onCanPlay}
          onTimeUpdate={this.onTimeUpdate}
          onSeeked={this.onSeeked}
          onSeeking={this.onSeeking}
          onDurationChange={this.onDurationChange}
          controls
        />
        <div className={this.getElementClass('real-player-controls')}>
          <Thumbnails
            active={scrubbing}
            duration={duration}
            currentTime={currentTime}
            src={`https://image.mux.com/${video.muxPlaybackId}/storyboard.jpg`}
            width={284}
            height={160}
          />
        </div>
      </React.Fragment>
    );
  }

  renderTranscoder(video) {
    const { duration, currentTime, scrubbing } = this.state;
    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }

  renderVimeo(video) {
    const vimeoId = video.vimeoUri.split('/')[2];
    console.info('urgg', video);
    return (
      <React.Fragment>
        <h2>Thumbnail</h2>
        <img height="270" src={video.vimeoThumbnail} />
        <h2>Animated Thumbnail</h2>
        <img height="270" src={``} />
        <h2>Embedded Player</h2>
        <iframe
          frameBorder="0"
          src={`https://player.vimeo.com/video/${vimeoId}?background=1`}
          width="480"
          height="270"
          allow="autoplay; fullscreen"
        />
        <h2>Custom Player</h2>
        {/**
         * 
        <video
          height="270"
          ref={this.ref}
          onCanPlay={this.onCanPlay}
          onTimeUpdate={this.onTimeUpdate}
          onSeeked={this.onSeeked}
          onSeeking={this.onSeeking}
          onDurationChange={this.onDurationChange}
          controls
        />
         * 
         */}
      </React.Fragment>
    );
  }
}
