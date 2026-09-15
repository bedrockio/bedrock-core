import React from 'react';
import { Play } from 'lucide-react';

import { Button } from '@/components/ui/button';

import Code from 'components/Code';

import RequestBuilder from './RequestBuilder';

export default class Route extends React.Component {
  render() {
    const { route } = this.props;
    return (
      <Code
        action={
          <RequestBuilder
            route={route}
            trigger={
              <Button variant="outline" size="icon">
                <Play />
              </Button>
            }
          />
        }>
        {route}
      </Code>
    );
  }
}
