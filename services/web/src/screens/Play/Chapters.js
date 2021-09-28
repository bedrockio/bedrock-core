import React from 'react';
import { round } from 'lodash';
import bem from 'helpers/bem';

import './chapters.less';

@bem
export default class Chapters extends React.Component {
  getWidthForChapter(chapter) {
    const { chapters, duration } = this.props;
    const index = chapters.findIndex((c) => {
      return c === chapter;
    });
    const next = chapters[index + 1];
    const endTime = next ? next.startTime : duration;
    const pct = round(((endTime - chapter.startTime) / duration) * 100, 2);
    return `${pct}%`;
  }

  render() {
    console.info('hmm', this.props);
    return (
      <div className={this.getBlockClass()}>
        {this.props.chapters.map((chapter) => {
          return (
            <div
              className={this.getElementClass('chapter')}
              key={chapter.title}
              style={{ width: this.getWidthForChapter(chapter) }}
              onClick={() => this.props.onChapterClick(chapter)}>
              {chapter.title}
            </div>
          );
        })}
      </div>
    );
  }
}
