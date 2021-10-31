import React from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import Heading from './Heading';
import { withSession } from 'stores';
import 'github-markdown-css';
import { enrichMarkdown } from 'utils/markdown';

import './table.less';

@withSession
export default class StandardPage extends React.Component {
  render() {
    const { page, openApi } = this.props;
    const { organization } = this.context;
    const markdown = enrichMarkdown(page.markdown, {
      openApi,
      organization,
    });
    return (
      <div className="docs markdown-body">
        <ReactMarkdown
          allowDangerousHtml
          source={markdown}
          plugins={[gfm]}
          renderers={{
            code: CodeBlock,
            heading: Heading,
          }}
        />
      </div>
    );
  }
}
