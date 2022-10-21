import React from 'react';
import { Input, Dropdown } from '/semantic';

import { APP_URL } from '/utils/env';

export default class UrlField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prefix: 'https://',
    };
  }

  getValue(value = this.props.value) {
    return value.replace(/^https?:\/\//, '');
  }

  onPrefixChange = (evt, { value }) => {
    this.setState({
      prefix: value,
    });
  };

  onChange = (evt, { value, rest }) => {
    const { prefix } = this.state;
    if (prefix === 'site') {
      if (value && !value.startsWith('/')) {
        value = '/' + value;
      }
    } else if (value.startsWith(APP_URL)) {
      this.setState({
        prefix: 'site',
      });
      value = value.replace(APP_URL, '');
    } else {
      value = prefix + this.getValue(value);
    }
    this.props.onChange(evt, {
      value,
      ...rest,
    });
  };

  render() {
    const { prefix } = this.state;
    return (
      <Input
        fluid
        label={
          <Dropdown
            value={prefix}
            style={{ fontWeight: 'normal' }}
            options={[
              {
                text: 'http://',
                value: 'http://',
              },
              {
                text: 'https://',
                value: 'https://',
              },
              {
                text: 'Site',
                value: 'site',
              },
            ]}
            onChange={this.onPrefixChange}
          />
        }
        value={this.getValue()}
        onChange={this.onChange}
        placeholder="Type or paste URL"
      />
    );
  }
}
