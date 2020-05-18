import React from 'react';
import { pick } from 'lodash';
import * as STORES from './';

export default function inject(...names) {
  const Context = React.createContext();

  return function (Component) {
    Component.contextType = Context;

    return class Provider extends React.Component {

      constructor(props) {
        super(props);
        this.state = {
          stores: this.getStores()
        };
      }

      getStores() {
        return pick(STORES, names);
      }

      onStoreChange = () => {
        this.setState({
          stores: this.getStores()
        });
      }

      componentDidMount() {
        for (let name of names) {
          STORES[name].subscribe(this.onStoreChange);
        }
      }

      componentWillUnmount() {
        for (let name of names) {
          STORES[name].unsubscribe(this.onStoreChange);
        }
      }

      render() {
        const { stores } = this.state;
        return (
          <Context.Provider value={stores}>
            <Component {...this.props} />
          </Context.Provider>
        );
      }

    };

  };
}
