import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic';

export default class TextFilter extends React.Component {
  onChange = (evt, { value, ...rest }) => {
    if (this.props.regex) {
      value = `/${value}/i`;
    }
    this.props.onChange(evt, { value, ...rest });
  };

  render() {
    let { name, value, regex, ...rest } = this.props;
    if (regex) {
      value = value.replace(/^\/|\/\w*$/g, '');
    }
    return (
      <Form.Input
        {...rest}
        id={name}
        name={name}
        value={value}
        icon={{
          name: value ? 'close' : 'search',
          link: true,
          onClick: (evt) => {
            if (value) {
              this.onChange(evt, { name, value: '' });
              evt.currentTarget.parentNode.querySelector('input').focus();
            }
          },
        }}
        onChange={this.onChange}
      />
    );
  }
}

TextFilter.propTypes = {
  ...Form.Input.propTypes,
  name: PropTypes.string.isRequired,
  regex: PropTypes.bool,
};

TextFilter.defaultProps = {
  regex: false,
};
