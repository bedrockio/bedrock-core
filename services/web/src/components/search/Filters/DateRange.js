import React from 'react';
import { Form } from 'semantic';
import PropTypes from 'prop-types';
import DateField from 'components/form-fields/Date';
import { isEmpty } from 'lodash';

import SearchContext from '../Context';
import './date-range.less';

export default class DateRangeFilter extends React.Component {
  static contextType = SearchContext;

  onChange = (evt, { name: part, value }) => {
    const { name } = this.props;

    const range = this.context.getFilterValue(name) || {};
    if (value) {
      range[part] = value;
    } else {
      delete range[part];
    }

    value = isEmpty(range) ? null : range;

    if (this.props.onChange) {
      this.props.onChange(evt, { name, value });
    } else {
      this.context.onFilterChange(evt, { name, value });
    }
  };

  render() {
    const { label, name } = this.props;
    return (
      <Form.Field className="date-range">
        <label>{label}</label>
        <Form.Group>
          <DateField
            name="gte"
            value={this.context.getFilterValue(name)?.gte}
            placeholder="No Start"
            onChange={this.onChange}
            clearable
          />
          <span className="divider">&ndash;</span>
          <DateField
            name="lte"
            value={this.context.getFilterValue(name)?.lte}
            placeholder="No End"
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
