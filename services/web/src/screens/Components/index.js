import React from 'react';
import { Header, Button } from 'semantic-ui-react';
import { screen } from 'helpers';

@screen
export default class  extends React.Component {

  render() {
    return (
      <div>
        <Header size="huge">Huge Header</Header>
        <Header size="large">Large Header</Header>
        <Header size="medium">Medium Header</Header>
        <Header size="small">Small Header</Header>
        <Header size="tiny">Tiny Header</Header>
        <hr />
        <Button size="huge">Huge Button</Button>
        <Button size="large">Large Button</Button>
        <Button size="medium">Medium Button</Button>
        <Button size="small">Small Button</Button>
        <Button size="tiny">Tiny Button</Button>
      </div>
    );
  }

}
