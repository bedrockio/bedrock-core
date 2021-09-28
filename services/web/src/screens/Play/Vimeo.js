import React from 'react';
import { Button, Progress } from 'semantic';
import Vimeo from '@u-wave/react-vimeo';
import bem from 'helpers/bem';

import Chapters from './Chapters';

import './vimeo.less';

@bem
export default class VimeoPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      percent: 0,
      duration: 0,
      chapters: [],
    };
  }

  onReady = async (player) => {
    window.player = player;
    this.player = player;
    this.setState({
      status: 'ready',
      chapters: await player.getChapters(),
      duration: await player.getDuration(),
    });
  };

  onPlay = () => {
    this.setState({
      status: 'playing',
    });
  };

  onPause = () => {
    this.setState({
      status: 'paused',
    });
  };

  onPlayClick = () => {
    if (this.state.status === 'playing') {
      this.player.pause();
    } else {
      this.player.play();
    }
  };

  onTimeUpdate = ({ percent }) => {
    this.setState({
      state: 'pending',
      percent: percent * 100,
    });
  };

  onChapterClick = (chapter) => {
    this.player.setCurrentTime(chapter.startTime);
  };

  onTextTrackChange = (...args) => {
    console.info('text track change', args);
  };

  render() {
    const { status, percent, chapters, duration } = this.state;
    return (
      <div className={this.getBlockClass()}>
        <Button
          icon={status === 'playing' ? 'pause' : 'play'}
          onClick={this.onPlayClick}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
          }}
        />
        <Vimeo
          video="https://vimeo.com/610878857/3e233d7109"
          showByline={false}
          color="ff0000"
          showTitle={false}
          controls={false}
          onPlay={this.onPlay}
          onPause={this.onPause}
          onReady={this.onReady}
          onTimeUpdate={this.onTimeUpdate}
          onTextTrackChange={this.onTextTrackChange}
          autoplay
        />
        <div className={this.getElementClass('bottom')}>
          <Chapters
            chapters={chapters}
            duration={duration}
            onChapterClick={this.onChapterClick}
          />
          <Progress percent={percent} />
        </div>
      </div>
    );
  }
}
