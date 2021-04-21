import React from 'react';
import { Header, Button, Message, Segment, Dropdown, Table, Icon, Menu } from 'semantic-ui-react';
import { screen } from 'helpers';
import Spacer from '../../components/Layout/Spacer';

const options = [
  { key: 1, text: 'Choice 1', value: 1 },
  { key: 2, text: 'Choice 2', value: 2 },
  { key: 3, text: 'Choice 3', value: 3 },
]

@screen
export default class ComponentsScreen extends React.Component {

  render() {
    return (
      <div>
        <Header size="huge">Kitchen Sink</Header>

        <Segment>
          <Header size="large">Buttons</Header>
          <Spacer size="small" />
          <Header size="medium">Variations</Header>
          <Button>Standard</Button>
          <Button circular>Circular</Button>
          <Button basic>Basic</Button>
          
          <Spacer size="small" />
          <Header size="medium">Sizes</Header>

          <Button size="tiny">Tiny Button</Button>
          <Button size="small">Small Button</Button>
          <Button size="medium">Medium Button</Button>
          <Button size="large">Large Button</Button>
          <Button size="huge">Huge Button</Button>
        </Segment>

        <Segment>
          <Header size="large">Message</Header>
          <Spacer size="small" />

          <Header size="medium">Variations</Header>
          <Message>
            <Header size="small">Standard Message</Header>
            <p>Message Content</p>
          </Message>
          <Message info>
            <Header size="small">Info Message</Header>
            <p>Message Content</p>
          </Message>
          <Message success>
            <Header size="small">Success Message</Header>
            <p>Message Content</p>
          </Message>
          <Message warning>
            <Header size="small">Warning Message</Header>
            <p>Message Content</p>
          </Message>
          <Message error>
            <Header size="small">Error Message</Header>
            <p>Message Content</p>
          </Message>
        </Segment>

        <Segment>
          <Header size="large">Dropdown</Header>
          <Spacer size="small" />

          <Header size="medium">Variations</Header>
          <Dropdown placeholder='Selection' selection options={options} />
          <Dropdown placeholder='Search Selection' selection search options={options} />
          <Dropdown placeholder='Multiple Selection' multiple selection options={options} />
        </Segment>

        <Segment>
          <Header size="large">Table</Header>
          <Spacer size="small" />

          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Header</Table.HeaderCell>
                <Table.HeaderCell>Header</Table.HeaderCell>
                <Table.HeaderCell>Header</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <Table.Row>
                <Table.Cell>Cell</Table.Cell>
                <Table.Cell>Cell</Table.Cell>
                <Table.Cell>Cell</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Cell</Table.Cell>
                <Table.Cell>Cell</Table.Cell>
                <Table.Cell>Cell</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Cell</Table.Cell>
                <Table.Cell>Cell</Table.Cell>
                <Table.Cell>Cell</Table.Cell>
              </Table.Row>
            </Table.Body>

            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan="3">
                  <i>Footer</i>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>

        </Segment>
      </div>
    );
  }

}
