import React from 'react';

import { Icon } from 'semantic';

import bem from 'helpers/bem';

import { JumpLink } from 'components/Link';

import { Confirm, Layout } from 'components';
import Code from 'components/Code';
import { expandRef } from 'docs/utils';

import { DocsContext } from '../utils/context';

import EditableField from './EditableField';

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
    const { status } = this.props;
    return status >= 200 && status <= 300;
  }

  onToggleClick = () => {
    this.setState({
      open: !this.state.open,
    });
  };

  onDeleteConfirm = () => {
    const { path } = this.props;
    this.context.unsetPath(path);
  };

  render() {
    const { open } = this.state;
    const { path, status, schema, requestPath, requestBody, responseBody } =
      this.props;
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
          <Layout.Group grow>
            <EditableField
              type="summary"
              path={path}
              onClick={(evt) => {
                if (this.context.mode === 'edit') {
                  evt.stopPropagation();
                }
              }}
              className={this.getElementClass('summary')}
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
            />
          </Layout.Group>
          <Layout.Group>
            {this.context.canEditDocs() && (
              <React.Fragment>
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
              </React.Fragment>
            )}
            <Icon size="small" name={open ? 'minus' : 'plus'} link />
          </Layout.Group>
        </Layout>
        {open && (
          <div className={this.getElementClass('content')}>
            {this.renderRequestPath(requestPath)}
            {this.renderSchema(schema)}
            {this.renderBody('Request Body:', requestBody)}
            {this.renderBody('Response Body:', responseBody)}
          </div>
        )}
      </div>
    );
  }

  renderRequestPath(path) {
    if (path) {
      return (
        <div className={this.getElementClass('request-path')}>
          <div className={this.getElementClass('header')}>Path:</div>
          <Code>{path}</Code>
        </div>
      );
    }
  }

  renderSchema(schema) {
    if (schema?.$ref) {
      const { name } = expandRef(schema.$ref);
      return (
        <div className={this.getElementClass('schema')}>
          <div className={this.getElementClass('header')}>
            Returns: <JumpLink to={name}>{name}</JumpLink>
          </div>{' '}
        </div>
      );
    }
  }

  renderBody(title, body) {
    if (typeof body === 'object') {
      body = JSON.stringify(body, null, 2);
    }
    if (body) {
      return (
        <div className={this.getElementClass('body')}>
          <div className={this.getElementClass('header')}>{title}</div>
          <Code language="json">{body}</Code>
        </div>
      );
    }
  }
}
