import React, { createRef } from 'react';
import {
  Header,
  Button,
  Message,
  Segment,
  Dropdown,
  Table,
  Label,
  Icon,
  Container,
  Grid,
  Divider,
  Menu,
  Sticky,
  Ref,
  Form,
  Input,
  TextArea,
  Breadcrumb,
  Statistic,
  Card,
  Progress
} from 'semantic';
import { screen } from 'helpers';
import Spacer from '../../components/Layout/Spacer';
import { JumpLink } from 'components/Link';
import { Layout, Breadcrumbs } from 'components';
import { Link, NavLink } from 'react-router-dom/cjs/react-router-dom.min';
const options = [
  { key: 1, text: 'Choice 1', value: 1 },
  { key: 2, text: 'Choice 2', value: 2 },
  { key: 3, text: 'Choice 3', value: 3 },
];

const options2 = [
  { key: 1, text: 'Apple', value: 1, icon: 'apple-alt' },
  { key: 2, text: 'Lemon', value: 2, icon: 'lemon' },
  { key: 3, text: 'Carrot', value: 3, icon: 'carrot' },
  { key: 4, text: 'Pepper', value: 4, icon: 'pepper-hot' },
];

@screen
export default class ComponentsScreen extends React.Component {
  contextRef = createRef();
  static layout = 'Portal';

  render() {
    return (
      <React.Fragment>
        <Breadcrumb size="mini">
          <Breadcrumb.Section link as={Link} to="/docs/api">
            Docs
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="chevron-right" />
          <Breadcrumb.Section>UI Components</Breadcrumb.Section>
        </Breadcrumb>
        <Divider hidden />
        <Grid>
          <Grid.Row>
          <Grid.Column width={3} only="tablet computer">
              <Sticky offset={131} context={this.contextRef}>
                <Menu fluid pointing secondary vertical>
                  <JumpLink className="menu item" to="buttons">
                    Buttons
                  </JumpLink>
                  <JumpLink className="menu item" to="message">
                    Message
                  </JumpLink>
                  <JumpLink className="menu item" to="form">
                    Form
                  </JumpLink>
                  <JumpLink className="menu item" to="dropdown">
                    Dropdown
                  </JumpLink>
                  <JumpLink className="menu item" to="table">
                    Table
                  </JumpLink>
                  <JumpLink className="menu item" to="icon">
                    Icon
                  </JumpLink>
                  <JumpLink className="menu item" to="label">
                    Label
                  </JumpLink>
                  <JumpLink className="menu item" to="segment">
                    Segment
                  </JumpLink>
                  <JumpLink className="menu item" to="container-grid">
                    Container & Grid
                  </JumpLink>
                  <JumpLink className="menu item" to="header">
                    Header
                  </JumpLink>
                  <JumpLink className="menu item" to="menu">
                    Menu
                  </JumpLink>
                  <JumpLink className="menu item" to="breadcrumbs">
                    Breadcrumbs
                  </JumpLink>
                  <JumpLink className="menu item" to="divider">
                    Divider
                  </JumpLink>
                  <JumpLink className="menu item" to="statistic">
                    Statistic
                  </JumpLink>
                  <JumpLink className="menu item" to="card">
                    Card
                  </JumpLink>
                  <JumpLink className="menu item" to="progress">
                    Progress
                  </JumpLink>
                </Menu>
              </Sticky>
            </Grid.Column>
            <Grid.Column width={16} only="mobile" style={{ zIndex:'1', marginBottom: '20px' }}>
              <Menu fluid>
                <Dropdown text="Components Menu" className="link item" fluid style={{ justifyContent:'space-between' }}>
                    <Dropdown.Menu>
                      <JumpLink className="item" to="buttons">Buttons</JumpLink>
                      <JumpLink className="item" to="message">Message</JumpLink>
                      <JumpLink className="item" to="form">Form</JumpLink>
                      <JumpLink className="item" to="dropdown">Dropdown</JumpLink>
                      <JumpLink className="item" to="table">Table</JumpLink>
                      <JumpLink className="item" to="icon">Icon</JumpLink>
                      <JumpLink className="item" to="label">Label</JumpLink>
                      <JumpLink className="item" to="segment">Segment</JumpLink>
                      <JumpLink className="item" to="container-grid">Container & Grid</JumpLink>
                      <JumpLink className="item" to="header">Header</JumpLink>
                      <JumpLink className="item" to="menu">Menu</JumpLink>
                      <JumpLink className="item" to="breadcrumbs">Breadcrumbs</JumpLink>  
                      <JumpLink className="item" to="divider">Divider</JumpLink>
                      <JumpLink className="item" to="statistic">Statistic</JumpLink>
                      <JumpLink className="item" to="card">Card</JumpLink>
                      <JumpLink className="item" to="progress">Progress</JumpLink>
                    </Dropdown.Menu>
                  </Dropdown>
              </Menu>
              </Grid.Column>
            <Grid.Column width={13}>
              <Ref innerRef={this.contextRef}>
                <div>
                  <Header size="huge">UI Components</Header>

                  <JumpLink.Target id="buttons">
                    <Header size="large">Buttons</Header>
                    <Spacer size="small" />

                    <Header size="medium">Variations</Header>
                    <Button content="Standard" />
                    <Button circular content="Circular" />
                    <Button basic content="Basic" />

                    <Header size="medium">Sizes</Header>
                    <Button size="tiny" content="Tiny" />
                    <Button size="small" content="Small" />
                    <Button size="medium" content="Medium" />
                    <Button size="large" content="Large" />
                    <Button size="huge" content="Huge" />

                    <Header size="medium">With Icon</Header>
                    <Button icon="check" content="Complete Task" />
                    <Button icon="globe" />
                    <Button icon="globe" basic />
                  </JumpLink.Target>

                  <div style={{ margin:'50px 0 20px 0', borderBottom:'1px solid #ccc' }} />

                  <JumpLink.Target id="message">
                    <Header size="large">Message</Header>
                    <Spacer size="small" />

                    <Header size="medium">Variations</Header>
                    <Message icon>
                      <Icon name="circle-notch" loading />
                      <Message.Content>
                        <Header size="small">Loading</Header>
                        Message Content
                      </Message.Content>
                    </Message>
                    <Message info>
                      <Header size="small">Info</Header>
                      Message Content
                    </Message>
                    <Message success icon>
                      <Icon name="check" />
                      <Message.Content>
                        <Header size="small">Success</Header>
                        Message Content
                      </Message.Content>
                    </Message>
                    <Message warning>
                      <Header size="small">Warning</Header>
                      Message Content
                    </Message>
                    <Message error>
                      <Header size="small">Error</Header>
                      Message Content
                    </Message>
                  </JumpLink.Target>

                  <div style={{ margin:'50px 0 20px 0', borderBottom:'1px solid #ccc' }} />

                  <JumpLink.Target id="form">
                    <Header size="large">Form</Header>
                    <Spacer size="small" />

                    <Form>
                      <Header size="medium">Input Field</Header>
                      <Form.Field>
                        <label>Label</label>
                        <Input placeholder="Placeholder" type="text" />
                      </Form.Field>

                      <Form.Field>
                        <Input placeholder="Placeholder" label="Label" type="text" />
                      </Form.Field>

                      <Form.Field>
                        <Input labelPosition="right" type="text" placeholder="Amount">
                          <Label basic>$</Label>
                          <input />
                          <Label>.00</Label>
                        </Input>
                      </Form.Field>

                      <Form.Field>
                        <Input placeholder="Search" type="search" icon="search" />
                      </Form.Field>

                      <Header size="medium">Checkbox</Header>
                      <Form.Field>
                        <Form.Checkbox label="Checkbox 1" />
                        <Form.Checkbox label="Checkbox 2" />
                      </Form.Field>

                      <Header size="medium">Toggle Checkbox</Header>
                      <Form.Field>
                        <Form.Checkbox toggle label="Toggle 1" />
                        <Form.Checkbox toggle label="Toggle 2" />
                      </Form.Field>

                      <Header size="medium">Radio</Header>
                      <Form.Field>
                        <Form.Radio
                          label="Radio 1"
                          id="1"
                          name="radio"
                          value="1"
                          checked
                        />
                        <Form.Radio
                          label="Radio 2"
                          id="2"
                          name="radio"
                          value="2"
                        />
                      </Form.Field>

                      <Header size="medium">Text Area</Header>
                      <Form.Field>
                        <TextArea
                          label="Label"
                          placeholder="Placeholder text..."
                        />
                      </Form.Field>
                    </Form>
                  </JumpLink.Target>

                  <div style={{ margin:'50px 0 20px 0', borderBottom:'1px solid #ccc' }} />

                  <JumpLink.Target id="dropdown">
                    <Header size="large">Dropdown</Header>
                    <Spacer size="small" />

                    <Header size="medium">Variations</Header>
                    <Layout horizontal>
                      <Dropdown
                        placeholder="Selection"
                        selection
                        options={options}
                      />
                      <div
                        style={{
                          display: 'inline-block',
                          width: '16px',
                        }}></div>
                      <Dropdown
                        placeholder="Selection with Icons"
                        selection
                        options={options2}
                      />
                      <div
                        style={{
                          display: 'inline-block',
                          width: '16px',
                        }}></div>
                      <Dropdown
                        placeholder="Typeahead Selection"
                        selection
                        search
                        options={options}
                      />
                    </Layout>
                    <Divider hidden />
                    
                    <Layout horizontal>
                      <Dropdown
                        placeholder="Multiple Options Selection"
                        multiple
                        selection
                        options={options}
                      />
                    </Layout>
                  </JumpLink.Target>

                  <div style={{ margin:'50px 0 20px 0', borderBottom:'1px solid #ccc' }} />

                  <JumpLink.Target id="table">
                    <Header size="large">Table</Header>
                    <Spacer size="small" />

                    <Header size="medium">Celled Table</Header>

                    <Table celled>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Header 1</Table.HeaderCell>
                          <Table.HeaderCell>Header 2</Table.HeaderCell>
                          <Table.HeaderCell>Header 3</Table.HeaderCell>
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

                    <Header size="medium">Very Basic Table</Header>

                    <Table basic="very">
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Header 1</Table.HeaderCell>
                          <Table.HeaderCell>Header 2</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        <Table.Row>
                          <Table.Cell>Cell</Table.Cell>
                          <Table.Cell>Cell</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>Cell</Table.Cell>
                          <Table.Cell>Cell</Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>

                    <Header size="medium">Definition Table</Header>

                    <Table definition>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell />
                          <Table.HeaderCell>Header 2</Table.HeaderCell>
                          <Table.HeaderCell>Header 3</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        <Table.Row>
                          <Table.Cell>Definition 1</Table.Cell>
                          <Table.Cell>Cell</Table.Cell>
                          <Table.Cell>Cell</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>Definition 2</Table.Cell>
                          <Table.Cell>Cell</Table.Cell>
                          <Table.Cell>Cell</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>Definition 3</Table.Cell>
                          <Table.Cell>Cell</Table.Cell>
                          <Table.Cell>Cell</Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>

                  </JumpLink.Target>

                  <div style={{ margin:'50px 0 20px 0', borderBottom:'1px solid #ccc' }} />

                  <JumpLink.Target id="icon">
                    <Header size="large">Icon</Header>
                    <Spacer size="small" />

                    <Header size="medium">Variations</Header>

                    <Icon name="user" />
                    <Icon name="user" disabled />
                    <Icon name="user" color="blue" />
                    <Icon name="user" circular />
                    <Icon name="user" bordered />
                    <Icon name="user" circular inverted color="green" />
                    <Icon name="user" bordered inverted />
                  </JumpLink.Target>

                  <div style={{ margin:'50px 0 20px 0', borderBottom:'1px solid #ccc' }} />

                  <JumpLink.Target id="label">
                    <Header size="large">Label</Header>
                    <Spacer size="small" />

                    <Header size="medium">Variations</Header>
                    <Label>Standard label</Label>
                    <Label basic>Basic label</Label>
                    <Label circular>Circular label</Label>

                    <Header size="medium">Options</Header>

                    <Label>
                      <Icon name="envelope" /> Label with icon
                    </Label>

                    <Label as="a">
                      Label as Link <Icon name="times" />
                    </Label>

                    <Label color="blue">Colored label</Label>

                    <Header size="medium">Colors</Header>

                    <Label color="red">Red label</Label>
                    <Label color="orange">Orange label</Label>
                    <Label color="yellow">Yellow label</Label>
                    <Label color="olive">Olive label</Label>
                    <Label color="green">Green label</Label>
                    <Label color="teal">Teal label</Label>
                    <Label color="blue">Blue label</Label>
                    <Label color="violet">Violet label</Label>
                    <Label color="purple">Purple label</Label>
                    <Label color="pink">Pink label</Label>
                    <Label color="brown">Brown label</Label>
                    <Label color="grey">Grey label</Label>
                    <Label color="black">Black label</Label>

                  </JumpLink.Target>

                  <div style={{ margin:'50px 0 20px 0', borderBottom:'1px solid #ccc' }} />

                  <JumpLink.Target id="segment">
                    <Header size="large">Segment</Header>
                    <Spacer size="small" />

                    <Header size="medium">Variations</Header>

                    <Segment>
                      Standard Segment
                    </Segment>

                    <Segment raised>
                      Raised Segment
                    </Segment>

                    <Segment attached="top">
                      Attached Top Segment
                    </Segment>
                    <Segment attached>
                      Attached Segment
                    </Segment>
                    <Segment attached="bottom">
                      Attached Bottom Segment
                    </Segment>

                    <Segment.Group>
                      <Segment>
                        Grouped Main Segment
                      </Segment>
                      <Segment secondary>
                        Grouped Secondary Segment
                      </Segment>
                    </Segment.Group>

                    <Segment placeholder>
                      <Header icon>
                        <Icon name="envelope" />
                        Placeholder Segment
                      </Header>
                      <Button
                        as={Link}
                        to="#"
                        primary
                        size="large"
                      >
                        Action
                      </Button>
                    </Segment>
                  </JumpLink.Target>

                  <div style={{ margin:'50px 0 20px 0', borderBottom:'1px solid #ccc' }} />

                  <JumpLink.Target id="container-grid">
                    <Header size="large">Container & Grid</Header>
                    <Spacer size="small" />

                    <Header size="medium">Container</Header>

                    <Container>
                      <div>Content within a Container</div>
                    </Container>

                    <Spacer size="small" />

                    <h4>16 Columns Grid</h4>
                    <Grid>
                      <Grid.Column>
                        <Label>1</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>2</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>3</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>4</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>5</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>6</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>7</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>8</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>9</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>10</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>11</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>12</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>13</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>14</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>15</Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Label>16</Label>
                      </Grid.Column>
                    </Grid>
                  </JumpLink.Target>

                  <div style={{ margin:'50px 0 20px 0', borderBottom:'1px solid #ccc' }} />

                  <JumpLink.Target id="header">
                    <Header size="large">Header</Header>
                    <Spacer size="small" />

                    <Header size="medium">Page Variations</Header>

                    <Header as="h1">h1 Header</Header>

                    <Header as="h2">h2 Header</Header>

                    <Header as="h3">h3 Header</Header>

                    <Header as="h4">h4 Header</Header>

                    <Header as="h5">h5 Header</Header>

                    <Header as="h6">h6 Header</Header>

                    <div style={{ display: 'block', height: '5px' }} />
                    <Divider />

                    <Header size="medium">Content Variations</Header>

                    <Header size="tiny">Tiny Header</Header>

                    <Header size="small">Small Header</Header>

                    <Header size="medium">Medium Header</Header>

                    <Header size="large">Large Header</Header>

                    <Header size="huge">Huge Header</Header>
                  </JumpLink.Target>

                  <div style={{ margin:'50px 0 20px 0', borderBottom:'1px solid #ccc' }} />

                  <JumpLink.Target id="menu">
                    <Header size="large">Menu</Header>
                    <Spacer size="small" />

                    <Header size="medium">Variations</Header>

                    <Header size="small">Primary</Header>

                    <Menu>
                      <Menu.Item active>Tab 1</Menu.Item>
                      <Menu.Item>Tab 2</Menu.Item>
                      <Menu.Item>Tab 3</Menu.Item>
                    </Menu>

                    <Header size="small">Secondary</Header>

                    <Menu secondary>
                      <Menu.Item active>Tab 1</Menu.Item>
                      <Menu.Item>Tab 2</Menu.Item>
                      <Menu.Item>Tab 3</Menu.Item>
                    </Menu>

                    <Header size="small">Secondary Pointing</Header>

                    <Menu secondary pointing>
                      <Menu.Item active>Tab 1</Menu.Item>
                      <Menu.Item>Tab 2</Menu.Item>
                      <Menu.Item>Tab 3</Menu.Item>
                    </Menu>

                    <Header size="small">Primary Vertical</Header>

                    <Menu vertical>
                      <Menu.Item active>Tab 1</Menu.Item>
                      <Menu.Item>Tab 2</Menu.Item>
                      <Menu.Item>Tab 3</Menu.Item>
                    </Menu>

                    <Header size="small">Secondary Vertical</Header>

                    <Menu secondary vertical>
                      <Menu.Item active>Tab 1</Menu.Item>
                      <Menu.Item>Tab 2</Menu.Item>
                      <Menu.Item>Tab 3</Menu.Item>
                    </Menu>

                    <Header size="small">Secondary Vertical Pointing</Header>

                    <Menu secondary vertical pointing>
                      <Menu.Item active>Tab 1</Menu.Item>
                      <Menu.Item>Tab 2</Menu.Item>
                      <Menu.Item>Tab 3</Menu.Item>
                    </Menu>
                  </JumpLink.Target>

                  <div style={{ margin:'50px 0 20px 0', borderBottom:'1px solid #ccc' }} />

                  <JumpLink.Target id="breadcrumbs">
                    <Header size="large">Breadcrumbs</Header>
                    <Spacer size="small" />

                    <Header size="medium">Standard Breadcrumbs</Header>

                    <Breadcrumbs link="One" active="Two Active" />

                    <Breadcrumbs active="One Active" />
                  </JumpLink.Target>

                  <div style={{ margin:'50px 0 20px 0', borderBottom:'1px solid #ccc' }} />
                  
                  <JumpLink.Target id="divider">
                    <Header size="large">Divider</Header>
                    <Spacer size="small" />

                    <Header size="medium">Standard Divider</Header>

                    <Divider />

                    <Header size="medium">Divider with Text</Header>

                    <Divider horizontal>OR</Divider>
                  </JumpLink.Target>

                  <JumpLink.Target id="statistic">
                    <Header size="large">Statistic</Header>
                    <Spacer size="small" />

                    <Header size="medium">Variations</Header>

                    <Layout horizontal>
                    <Statistic>
                      <Statistic.Value>74,550</Statistic.Value>
                      <Statistic.Label>Bottom Label</Statistic.Label>
                    </Statistic>

                    <Statistic>
                      <Statistic.Label>Top Label</Statistic.Label>
                      <Statistic.Value>25,150</Statistic.Value>
                    </Statistic>
                    </Layout>
                  </JumpLink.Target>

                  <JumpLink.Target id="card">
                    <Header size="large">Card</Header>
                    <Spacer size="small" />

                    <Header size="medium">Variations</Header>

                    <Card.Group>
                      <Card>
                        <Card.Content>
                          <Card.Header>
                            Card Header
                          </Card.Header>
                          <Card.Meta>
                            Meta text
                          </Card.Meta>
                          <Card.Description>Description</Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                          Extra info
                        </Card.Content>
                      </Card>

                      <Card href="#">
                        <Card.Content>
                          <Card.Header>
                            Linked Card
                          </Card.Header>
                          <Card.Meta>
                            Meta text
                          </Card.Meta>
                          <Card.Description>Description</Card.Description>
                          </Card.Content>
                          <Card.Content extra>
                          <Button
                            basic
                            content="Action"
                            onClick={() => this}
                          />
                        </Card.Content>
                      </Card>
                    </Card.Group>

                    <Card fluid color="red">
                      <Card.Content>
                        <Card.Header>
                          Fluid Card with Color
                        </Card.Header>
                        <Card.Meta>
                          Meta Text
                        </Card.Meta>
                        <Card.Description>Description</Card.Description>
                      </Card.Content>
                      <Card.Content extra>
                        <Button
                          basic
                          icon="check"
                          content="Action"
                          onClick={() => this}
                        />
                      </Card.Content>
                    </Card>
                  </JumpLink.Target>

                  <JumpLink.Target id="progress">
                    <Header size="large">Progress</Header>
                    <Spacer size="small" />

                    <Header size="medium">Variations</Header>

                    <b>Standard</b>
                    <Progress percent={11} />

                    <b>Standard with percentage</b>
                    <Progress percent={44} progress />

                    <b>Colored</b>
                    <Progress percent={32} color="purple" />

                    <b>Tiny Size</b>
                    <Progress percent={78} color="blue" size="tiny" />

                  </JumpLink.Target>

                </div>
              </Ref>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
    );
  }
}
