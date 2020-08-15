import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';

export default class TextFilter extends React.Component {
  render() {
    const { name, value, onChange } = this.props;
    return (
      <Form.Input
        id={name}
        icon={{
          name: value ? 'close' : 'search',
          link: true,
          onClick: (evt) => {
            if (value) {
              onChange(evt, { name, value: '' });
              evt.target.parentNode.querySelector('input').focus();
            }
          },
        }}
        {...this.props}
      />
    );
  }
}

TextFilter.propTypes = {
  ...Form.Input.propTypes,
  name: PropTypes.string.isRequired,
};
