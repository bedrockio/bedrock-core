import React from 'react';
export const Context = React.createContext();

import { request, hasToken } from 'utils/api';

export default class DocsProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      application: undefined,
    };
  }

  componentDidMount() {
    if (hasToken()) {
      this.selectDefaultApplication();
    }
  }

  selectDefaultApplication = async () => {
    const { data } = await request({
      method: 'POST',
      path: '/1/applications/mine/search',
    });
    if (data.length) {
      this.setState({
        application: data[0],
      });
    }
  };

  setApplication = (application) => {
    this.setState({
      application,
    });
  };

  render() {
    const context = {
      ...this.state,
      setApplication: this.setApplication,
    };

    return (
      <Context.Provider value={context}>{this.props.children}</Context.Provider>
    );
  }
}
