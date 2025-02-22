import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Message, Form } from 'semantic';

import { withSession } from 'contexts/session';

import screen from 'helpers/screen';

import Logo from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';
import CodeField from 'components/form-fields/Code';

import { formatPhone } from 'utils/formatting';

import { request } from 'utils/api';

@screen
@withSession
export default class LoginCode extends React.Component {
  static layout = 'basic';
  static title = 'Enter Code';

  state = {
    error: null,
    loading: false,
    code: '',
  };

  componentDidMount() {
    if (this.context.isLoggedIn()) {
      this.props.history.push('/');
    }
  }

  setField = (evt, { name, value }) => {
    this.setState({
      [name]: value,
    });
  };

  onSubmitCode = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { code } = this.state;
      const { type, email, phone } = this.props.location.state;
      let token;
      if (type === 'totp') {
        const { data } = await request({
          method: 'POST',
          path: '/1/auth/totp/login',
          body: {
            email,
            code,
          },
        });
        token = data.token;
      } else {
        const { data } = await request({
          method: 'POST',
          path: '/1/auth/otp/login',
          body: {
            email,
            phone,
            code,
          },
        });
        token = data.token;
      }

      const next = await this.context.authenticate(token);
      this.props.history.push(next);
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { error, code } = this.state;
    return (
      <React.Fragment>
        <Logo title="Enter Code" />
        <Segment.Group>
          <Segment padded>
            {this.renderMessage()}
            <Form error={!!error} size="large" onSubmit={this.onSubmitCode}>
              <CodeField
                name="code"
                value={code}
                onChange={this.setField}
                onComplete={this.onSubmitCode}
              />
              {error?.type !== 'validation' && <ErrorMessage error={error} />}
            </Form>
          </Segment>
          <Segment secondary>
            <Link to="/login">Back</Link>
          </Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }

  renderMessage() {
    const { type, email, phone } = this.props.location.state || {};
    if (type === 'otp') {
      if (phone) {
        return <Message info>Enter code sent to {formatPhone(phone)}.</Message>;
      } else if (email) {
        return <Message info>Enter code sent to {email}.</Message>;
      }
    } else if (type === 'totp') {
      return <Message info>Enter code in authenticator app.</Message>;
    }
  }
}
