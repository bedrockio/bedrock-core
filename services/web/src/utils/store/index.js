import React from 'react';
import { get } from 'lodash';
import { createStore as createReduxStore, combineReducers } from 'redux';

let storeMap;
let store;

export class BaseStore {

  static getReducer(store) {
    this.store = store;
    return (state = this.getInitialState(), action) => {
      if (action.store === store) {
        switch (action.type) {
          case 'REQUEST':
            return this.handleRequest(state, action);
          case 'RESPONSE':
            return this.handleResponse(state, action);
        }
      }
      return state;
    }
  }

  static getInitialState() {
    return {
      register: {}
    }
  }

  static handleRequest(state, action) {
    const { params } = action;
    return {
      ...state,
      global: {
        loading: true,
        params,
      },
      [action.component]: {
        loading: true,
        params,
      }
    };
  }

  static handleResponse(state, action) {
    let { register } = state;
    let { data, meta = {} } = action.response;
    const { params } = state[action.component];

    if (Array.isArray(data)) {
      // Normalize
      data = data.map((item) => {
        register = {
          ...register,
          [item.id]: this.parseItem(item),
        };
        return item.id;
      });
    } else {
      register = {
        ...register,
        [data.id]: this.parseItem(data),
      };
      data = data.id;
    }

    return {
      ...state,
      register,
      global: {
        meta,
        data,
        params,
        loading: false,
      },
      [action.component]: {
        meta,
        data,
        params,
        loading: false,
      }
    }
  }

  static parseItem(item) {
    return {
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }
  }

  constructor(component) {
    this.component = component;
  }

  get loading() {
    return get(this.getState(), ['loading']) !== false;
  }

  get error() {
    return get(this.getState(), ['error']) || null;
  }

  get meta() {
    return get(this.getState(), ['meta']) || {};
  }

  get params() {
    return get(this.getState(), ['params']) || {};
  }

  get total() {
    return this.meta.total || 0;
  }

  get limit() {
    return this.meta.limit || 0;
  }

  get page() {
    return this.params.page || 1;
  }

  get sort() {
    return this.params.sort || 'desc';
  }

  // For Semantic
  get sorted() {
    return this.sort === 'desc' ? 'descending' : 'ascending';
  }

  get empty() {
    return this.loading || this.items.length === 0;
  }

  get items() {
    return get(this.getState(), ['data'], []).map((id) => {
      return this.getItem(id);
    });
  }

  get item() {
    const register = get(store.getState(), [this.constructor.store]).register;
    const id = get(this.getState('global'), ['data']);
    return register[id];
  }

  getItem(id) {
    const register = get(store.getState(), [this.constructor.store]).register;
    return register[id];
  }

  map(fn) {
    return this.items.map(fn);
  }

  getState(path = this.component) {
    return get(store.getState(), [this.constructor.store, path]);
  }

  dispatch(obj) {
    store.dispatch({
      ...obj,
      store: this.constructor.store,
      component: this.component,
    });
  }

  dispatchRequest(action, params) {
    this.dispatch({
      type: 'REQUEST',
      action,
      params,
    });
  }

  dispatchResponse(action, response) {
    this.dispatch({
      type: 'RESPONSE',
      action,
      response,
    });
  }

}

export function createStore(map) {

  const reducers = {};

  for (let [name, Store] of Object.entries(map)) {
    if (Store.getReducer) {
      reducers[name] = Store.getReducer(name);
    }
  }

  storeMap = map;

  store = createReduxStore(
    combineReducers(reducers),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
  return store;
}

export function action(proto, actionName, descriptor) {
  const fn = descriptor.value;
  descriptor.value = async function (params) {
    this.dispatchRequest(actionName, params);
    const response = await fn.apply(this, arguments);
    this.dispatchResponse(actionName, response);
  };
}

export function inject(...names) {
  let stores;

  return function(Component) {

    function getStores() {
      if (!stores) {
        stores = {};
        for (let name of names) {
          const store = storeMap[name];
          if (typeof store === 'function') {
            stores[name] = new store(Component.name);
          } else {
            stores[name] = store;
          }
        }
      }
      return stores;
    }

    return class InjectedComponent extends React.Component {

      constructor(props) {
        super(props);
        this.stores = getStores();
      }

      componentDidMount() {
        this.lastState = store.getState();
        this.unsubscribe = store.subscribe(this.onStateChange);
      }

      componentWillUnmount() {
        this.unsubscribe();
        this.unsubscribe = null;
        this.lastState = null;
      }

      onStateChange = () => {
        let changed = false;
        const state = store.getState();
        for (let name of names) {
          const path = [name, Component.name];
          if (get(state, path) !== get(this.lastState, path)) {
            changed = true;
          }
        }
        if (changed) {
          this.forceUpdate();
        }
        this.lastState = state;
      }

      render() {
        return <Component {...this.props} {...this.stores} />
      }

    }

  }

}
