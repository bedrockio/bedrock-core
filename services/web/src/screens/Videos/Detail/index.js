import React from 'react';
import { Link } from 'react-router-dom';
import { Switch, Route } from 'react-router-dom';
import { Protected } from 'helpers/routes';
import { Loader } from 'semantic';
import { request } from 'utils/api';

import NotFound from 'screens/NotFound';
import Overview from './Overview';
import Player from './Player';
import Status from './Status';

export default class VideoDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      video: null,
      error: null,
      loading: true,
    };
  }

  onSave = () => {
    this.fetchVideo();
  };

  componentDidMount() {
    this.fetchVideo();
  }

  componentDidUpdate(lastProps) {
    const { id } = this.props.match.params;
    if (id !== lastProps.match.params.id) {
      this.fetchVideo();
    }
  }

  async fetchVideo() {
    const { id } = this.props.match.params;
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'GET',
        path: `/1/videos/${id}`,
      });
      this.setState({
        video: data,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  }

  render() {
    const { loading, error } = this.state;
    if (loading) {
      return <Loader active>Loading</Loader>;
    } else if (error) {
      return (
        <NotFound
          link={<Link to="/videos">Videos</Link>}
          message="Sorry that video wasn't found."
        />
      );
    }

    const props = {
      ...this.state,
      onSave: this.onSave,
    };
    return (
      <Switch>
        <Protected exact path="/videos/:id" allowed={Overview} {...props} />
        <Protected
          exact
          path="/videos/:id/player"
          allowed={Player}
          {...props}
        />
        <Protected
          exact
          path="/videos/:id/status"
          allowed={Status}
          {...props}
        />
        <Route component={NotFound} />
      </Switch>
    );
  }
}
