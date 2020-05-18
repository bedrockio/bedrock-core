import React from 'react';
import ReactMarkdown from 'react-markdown';
import AppWrapper from 'components/AppWrapper';
import GETTING_STARTED_MD from 'docs/GETTING_STARTED.md';
import CodeBlock from '../CodeBlock';
import 'github-markdown-css';
import inject from 'stores/inject';
import { API_URL, APP_NAME } from 'utils/env';

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
    API_URL.replace(/\/$/, '')
  );
  enrichedMarkdown = enrichedMarkdown.replace(
    new RegExp('<APP_NAME>', 'g'),
    APP_NAME.replace(/\/$/, '')
  );
  return enrichedMarkdown;
}

@inject('me')
export default class GettingStarted extends React.Component {
  state = {
    loading: true,
    error: null
  };

  render() {
    const { me } = this.context;
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
