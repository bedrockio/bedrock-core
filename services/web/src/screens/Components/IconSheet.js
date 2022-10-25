import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Card,
  Container,
  Divider,
  Dropdown,
  Form,
  Grid,
  Header,
  Icon,
  Input,
  Label,
  Menu,
  Message,
  Progress,
  Ref,
  Segment,
  Statistic,
  Table,
  TextArea,
} from 'semantic';
import screen from 'helpers/screen';
import { Layout } from 'components/Layout';
import Breadcrumbs from 'components/Breadcrumbs';
import RichTextField from 'components/form-fields/RichText';
import { Menu as ResponsiveMenu } from 'components/Responsive';
import { JumpLink, ExternalLink } from 'components/Link';

const options = [
  { key: 1, text: 'Choice 1', value: 1 },
  { key: 2, text: 'Choice 2', value: 2 },
  { key: 3, text: 'Choice 3', value: 3 },
];

const options2 = [
  { key: 1, text: 'Apple', value: 1, icon: 'apple-whole' },
  { key: 2, text: 'Lemon', value: 2, icon: 'lemon' },
  { key: 3, text: 'Carrot', value: 3, icon: 'carrot' },
  { key: 4, text: 'Pepper', value: 4, icon: 'pepper-hot' },
];

const icons = [

  { groupName: 'Solid', key: 'solid', icons: [
    { name: '0' },
    { name: '1' },
    { name: '2' },
    { name: '3' },
    { name: '4' },
    { name: '5' },
    { name: '6' },
    { name: '7' },
    { name: '8' },
    { name: '9' },
    { name: 'a' },
    { name: 'address-book' },
    { name: 'address-card' },
    { name: 'align-center' },
    { name: 'align-justify' },
    { name: 'align-left' },
    { name: 'align-right' },
  ]},
  { groupName: 'Regular', key: 'regular', icons: [
    { name: 'address-book' },
    { name: 'address-card' },
    { name: 'bell' },
    { name: 'bell-slash' },
    { name: 'bookmark' },
    { name: 'building' }
  ]},
  { groupName: 'Brands', key: 'brands', icons: [
    { name: 'facebook' },
    { name: 'twitter' }
  ]}
];

@screen
export default class ComponentsScreen extends React.Component {
  static layout = 'portal';

  contextRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      markdown: '',
    };
  }

  onFieldChange = (evt, { name, value }) => {
    this.setState({
      [name]: value,
    });
  };

  render() {
    const { markdown } = this.state;
    return (
      <React.Fragment>
        <Breadcrumb size="mini">
          <Breadcrumb.Section link as={Link} to="/docs">
            Docs
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="chevron-right" />
          <Breadcrumb.Section>Icons</Breadcrumb.Section>
        </Breadcrumb>
        <Divider hidden />
        <Layout horizontal top stackable>
          <Layout.Group size="200px" fixed>
            <ResponsiveMenu
              contextRef={this.contextRef}
              title="Icons Menu">
              { icons.map( group => (
                <JumpLink className="item" to={group.key}>
                  { group.groupName }
                </JumpLink>
              ) ) }
            </ResponsiveMenu>
          </Layout.Group>
          <Layout.Spacer size={1} />
          <Layout.Group>
            <Ref innerRef={this.contextRef}>
              <div>
                <Header size="huge">Icon sheet</Header>
                <p><a href="https://fontawesome.com/search?o=r&m=free&f=brands" target="_blank">Font Awesome Free</a> 6.2.0</p>

                { icons.map( group => (
                  <JumpLink.Target id={group.key}>
                    <Header size="Large">{group.groupName }</Header>
                    { group.icons.length !== 0 && (
                      <Grid doubling columns={6}>
                        {group.icons.map ( icon => (
                          <Grid.Column>
                            <Card>
                              <Card.Content>
                                <Card.Header align="center"><Icon name={`${icon.name} ${group.key !== "solid" ? group.key : ""}`} size="big" /></Card.Header>
                              </Card.Content>
                              <Card.Content extra>
                                <Card.Description>{`${icon.name} ${group.key !== "solid" ? group.key : ""}`}</Card.Description>
                                { icon.alternative && icon.alternative.length !== 0 &&
                                   icon.alternative.map( alt => (
                                    <Card.Meta>{alt}</Card.Meta>
                                  ))
                                }
                              </Card.Content>
                            </Card>
                          </Grid.Column>
                        ))}
                      </Grid>
                    )}
                  </JumpLink.Target>
                )) }
              </div>
            </Ref>
          </Layout.Group>
        </Layout>
      </React.Fragment>
    );
  }
}
