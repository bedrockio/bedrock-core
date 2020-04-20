import React from 'react';
import ReactMarkdown from 'react-markdown';
import AppWrapper from 'components/AppWrapper';
import GETTING_STARTED_MD from 'docs/GETTING_STARTED.md';
import CodeBlock from '../CodeBlock';
import 'github-markdown-css';
import { observer, inject } from 'mobx-react';
import request from 'utils/request';
import config from 'config';

function enrichMarkdown(markdown, me, credentials) {
  const { organization } = me;
  let enrichedMarkdown = markdown;
  if (organization) {
    enrichedMarkdown = enrichedMarkdown.replace(
      new RegExp('<ORGANIZATION_ID>', 'g'),
      organization.id
    );
  }
  if (credentials && credentials.length) {
    enrichedMarkdown = enrichedMarkdown.replace(
      new RegExp('<TOKEN>', 'g'),
      credentials[0].apiToken
    );
  }
  enrichedMarkdown = enrichedMarkdown.replace(
    new RegExp('<API_URL>', 'g'),
    config.API_URL.replace(/\/$/, '')
  );
  enrichedMarkdown = enrichedMarkdown.replace(
    new RegExp('<APP_NAME>', 'g'),
    config.APP_NAME.replace(/\/$/, '')
  );
  return enrichedMarkdown;
}

@inject('me')
@observer
export default class GettingStarted extends React.Component {
  state = {
    loading: true,
    error: null
  };

  componentDidMount() {
    const { me } = this.props;
    me.fetch().then(() => {});
  }

  render() {
    const { me } = this.props;
    const { credentials } = this.state;
    const markdown = enrichMarkdown(GETTING_STARTED_MD, me, credentials);
    return (
      <AppWrapper>
        <div className="docs markdown-body">
          <ReactMarkdown source={markdown} renderers={{ code: CodeBlock }} />
        </div>
      </AppWrapper>
    );
  }
}
