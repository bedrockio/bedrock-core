import React from 'react';

import { Icon } from 'semantic';

import { Layout } from 'components';
import Code from 'components/Code';
import bem from 'helpers/bem';

@bem
export default class DocsExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  isGood() {
    const { status } = this.props.item;
    return status >= 200 && status <= 300;
  }

  onToggleClick = () => {
    this.setState({
      open: !this.state.open,
    });
  };

  render() {
    const { open } = this.state;
    const { status, schema, requestBody, responseBody } = this.props.item;
    return (
      <div className={this.getBlockClass()}>
        <Layout
          horizontal
          center
          spread
          className={this.getElementClass(
            'title',
            this.isGood() ? 'good' : 'bad'
          )}
          onClick={this.onToggleClick}>
          <Layout.Group>{status}</Layout.Group>
          <Layout.Group>
            <Icon size="small" name={open ? 'minus' : 'plus'} link />
          </Layout.Group>
        </Layout>
        {open && (
          <React.Fragment>
            {this.renderSchema(schema)}
            {this.renderBody('Request Body:', requestBody)}
            {this.renderBody('Response Body:', responseBody)}
          </React.Fragment>
        )}
      </div>
    );
  }

  renderSchema(schema) {
    if (schema) {
      return <div>TODO</div>;
      // const { $ref } = schema;
      // const { name } = expandRef($ref);
      // return (
      //   <div className={this.getElementClass('schema')}>
      //     Returns: <JumpLink to={name}>{name}</JumpLink>
      //   </div>
      // );
    }
  }

  renderBody(title, body = {}) {
    const keys = Object.keys(body);
    if (keys.length) {
      return (
        <div className={this.getElementClass('body')}>
          <div>{title}</div>
          <Code language="json">{JSON.stringify(body, null, 2)}</Code>
        </div>
      );
    }
  }
}
