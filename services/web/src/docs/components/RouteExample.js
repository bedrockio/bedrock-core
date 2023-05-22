import React from 'react';

import { Icon } from 'semantic';

import { Confirm, Layout } from 'components';
import Code from 'components/Code';
import bem from 'helpers/bem';
import { expandRoute, getRoutePath } from 'docs/utils';

import { DocsContext } from '../utils/context';

import './route-example.less';

@bem
export default class RouteExample extends React.Component {
  static contextType = DocsContext;

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

  onDeleteConfirm = () => {
    const { id, status } = this.props.item;

    const path = [
      ...getRoutePath(this.props.route),
      'responses',
      status.toString(),
      'content',
      'application/json',
      'examples',
      id,
    ];

    this.context.unsetPath(path);
  };

  render() {
    const { open } = this.state;
    const { status, schema, path, requestBody, responseBody } = this.props.item;
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
            {this.context.canEditDocs() && (
              <Confirm
                negative
                size="small"
                confirmButton="Delete"
                header="Delete this example?"
                trigger={
                  <Icon
                    size="small"
                    name="trash"
                    link
                    onClick={(evt) => {
                      evt.stopPropagation();
                    }}
                  />
                }
                onConfirm={this.onDeleteConfirm}
              />
            )}
            <Icon size="small" name={open ? 'minus' : 'plus'} link />
          </Layout.Group>
        </Layout>
        {open && (
          <React.Fragment>
            {this.renderPath(path)}
            {this.renderSchema(schema)}
            {this.renderBody('Request Body:', requestBody)}
            {this.renderBody('Response Body:', responseBody)}
          </React.Fragment>
        )}
      </div>
    );
  }

  renderPath(path) {
    if (path) {
      return (
        <div className={this.getElementClass('path')}>
          <div>Path:</div>
          <Code>{path}</Code>
        </div>
      );
    }
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
