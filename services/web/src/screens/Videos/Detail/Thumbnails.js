import React from 'react';
import { round } from 'lodash';
import bem from 'helpers/bem';

import './thumbnails.less';

@bem
export default class Thumbnails extends React.Component {
  isInactive() {
    const { currentTime, duration } = this.props;
    return (duration || 0) < 1 || isNaN(currentTime);
  }

  getOverlayStyles() {
    if (this.isInactive()) {
      return { display: 'none' };
    }
    const { currentTime, duration, width, height } = this.props;
    const progress = round((currentTime / duration) * 100, 2);
    return {
      left: `${progress}%`,
      width: `${width}px`,
      height: `${height}px`,
    };
  }

  getSheetStyles() {
    if (this.isInactive()) {
      return { display: 'none' };
    }
    const { currentTime, duration, width, height } = this.props;
    // Every 1s
    const col = Math.floor(currentTime);
    const row = 0;
    const x = col * -width;
    const y = row * -height;

    return {
      transform: `translate(${x}px, ${y}px)`,
    };
  }

  render() {
    const { src, active } = this.props;
    return (
      <div className={this.getBlockClass()}>
        <div
          style={this.getOverlayStyles()}
          className={this.getElementClass('overlay', active ? 'active' : null)}>
          <div className={this.getElementClass('clip')}>
            <img
              src={src}
              style={this.getSheetStyles()}
              className={this.getElementClass('sheet')}
              draggable={false}
            />
          </div>
        </div>
      </div>
    );
  }
}
