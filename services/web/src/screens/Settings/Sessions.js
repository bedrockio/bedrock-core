import React from 'react';
import { Segment, Button, Divider, Label, Table } from 'semantic';

import { withSession } from 'stores/session';

import LoadButton from 'components/LoadButton';
import Meta from 'components/Meta';

import { parseToken } from 'utils/token';
import { getToken, request } from 'utils/api';

import { fromNow } from 'utils/date';
import countries from 'utils/countries';

import Menu from './Menu';

class Sessions extends React.Component {
  state = {
    error: null,
    loading: false,
    mfaMethod: null,
  };

  logout = async (body) => {
    await request({
      method: 'POST',
      path: '/1/auth/logout',
      body,
    });
    await this.context.bootstrap();
  };

  render() {
    const { authTokens } = this.context.user;
    const { jti } = parseToken(getToken());

    authTokens.sort((a, b) => {
      return new Date(b.lastLoginAt) - new Date(a.lastLoginAt);
    });

    return (
      <React.Fragment>
        <Meta title="Sessions" />
        <Menu />
        <Divider hidden />
        <Segment>
          <Table basic="very">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Device/Agent</Table.HeaderCell>
                <Table.HeaderCell>Country</Table.HeaderCell>
                <Table.HeaderCell>Last used</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {authTokens.map((token) => {
                const country = countries.find(
                  (country) => country.countryCode === token.country,
                );

                return (
                  <Table.Row key={token.jti}>
                    <Table.Cell>
                      {token.userAgent || 'No User Agent provided'}{' '}
                      {token.jti === jti && (
                        <Label horizontal>Current Session</Label>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {country?.nameEn || 'N/A'} ({token.ip})
                    </Table.Cell>
                    <Table.Cell>{fromNow(token.lastLoginAt)}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <LoadButton
                        basic
                        size="small"
                        onClick={() => this.logout({ jti: token.jti })}>
                        Logout
                      </LoadButton>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Segment>
        <Button primary negative onClick={() => this.logout({ all: true })}>
          Logout All
        </Button>
      </React.Fragment>
    );
  }
}

export default withSession(Sessions);
