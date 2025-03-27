import React from 'react';
import { Segment } from 'semantic-ui-react';
import { Link } from '@bedrockio/router';
import { Table, Button, Divider, Label } from 'semantic';

import Search from 'components/Search';
import Layout from 'components/Layout';
import Breadcrumbs from 'components/Breadcrumbs';
import SearchFilters from 'components/Search/Filters';

import EditTemplate from 'modals/EditTemplate';

import { request } from 'utils/api';

import Actions from '../Actions';

export default class TemplateList extends React.Component {
  onDataNeeded = async (body) => {
    return await request({
      method: 'POST',
      path: '/1/templates/search',
      body,
    });
  };

  getFilterMapping() {
    return {
      subject: {
        label: 'Subject',
      },
      keyword: {},
    };
  }

  render() {
    return (
      <Search.Provider
        onDataNeeded={this.onDataNeeded}
        filterMapping={this.getFilterMapping()}>
        {({ items: templates, getSorted, setSort, reload }) => {
          return (
            <React.Fragment>
              <Breadcrumbs active="Templates" />
              <Layout horizontal center spread stackable>
                <h1>Templates</h1>
                <Layout.Group>
                  <Search.Export filename="templates" />
                  <EditTemplate
                    trigger={
                      <Button primary content="New Template" icon="plus" />
                    }
                    onSave={reload}
                  />
                </Layout.Group>
              </Layout>

              <Segment>
                <Layout horizontal spread stackable>
                  <SearchFilters.Modal>
                    <SearchFilters.Keyword name="keyword" label="Keyword" />
                  </SearchFilters.Modal>

                  <Layout horizontal stackable center right>
                    <Search.Total />
                  </Layout>
                </Layout>
              </Segment>

              <Search.Status />

              {templates.length !== 0 && (
                <Table celled sortable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell
                        sorted={getSorted('name')}
                        onClick={() => setSort('name')}>
                        Name
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={getSorted('channels')}
                        onClick={() => setSort('channels')}>
                        Channels
                      </Table.HeaderCell>
                      <Table.HeaderCell textAlign="center">
                        Actions
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {templates.map((template) => {
                      return (
                        <Table.Row key={template.id}>
                          <Table.Cell>
                            <Link to={`/templates/${template.id}`}>
                              {template.name}
                            </Link>
                          </Table.Cell>
                          <Table.Cell>
                            {template.channels.map((channel) => {
                              return <Label key={channel}>{channel}</Label>;
                            })}
                          </Table.Cell>
                          <Table.Cell textAlign="center" singleLine>
                            <Actions template={template} reload={reload} />
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>
              )}
              <Divider hidden />
              <Search.Pagination />
            </React.Fragment>
          );
        }}
      </Search.Provider>
    );
  }
}
