import React from 'react';
import { Form } from 'semantic';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

import DateField from 'components/form-fields/Date';

import SearchContext from '../Context';
import './date-range.less';

export default class DateRangeFilter extends React.Component {
  static contextType = SearchContext;

  onChange = (evt, { name: part, value }) => {
    const { name } = this.props;

    const range = this.context.filters[name] || {};
    if (name === 'gte' && value === null) {
      delete range['lte'];
    }

    if (value) {
      range[part] = value;
    } else {
      // start = null => reset range to avoid
      if (part === 'gte') {
        delete range['lte'];
      }
      delete range[part];
    }

    value = isEmpty(range) ? null : range;

    if (this.props.onChange) {
      this.props.onChange(evt, { name, value });
    } else {
      this.context.onFilterChange({ name, value });
    }
  };

  render() {
    const { label, name } = this.props;
    return (
      <Form.Field className="date-range">
        <label>{label}</label>
        <Form.Group>
          <DateField
            start
            name="gte"
            value={this.context.filters[name]?.gte}
            placeholder="Start"
            onChange={this.onChange}
            clearable
          />
          <span className="divider">&ndash;</span>
          <DateField
            end
            name="lte"
            value={this.context.filters[name]?.lte}
            placeholder="Present"
            onChange={this.onChange}
            clearable
          />
        </Form.Group>
      </Form.Field>
    );
  }
}

DateRangeFilter.propTypes = {
  value: PropTypes.object,
  name: PropTypes.string.isRequired,
};

DateRangeFilter.defaultProps = {
  object: true,
  value: {},
};
