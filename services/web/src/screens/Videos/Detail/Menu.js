import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Button } from 'semantic';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs, Layout } from 'components';

import EditVideo from 'modals/EditVideo';

export default ({ video, onSave }) => {
  return (
    <React.Fragment>
      <Breadcrumbs
        link={<Link to="/videos">Videos</Link>}
        active={video.name}
      ></Breadcrumbs>
      <Layout horizontal center spread>
        <h1>{video.name}</h1>
        <Layout.Group>
          <EditVideo
            video={video}
            onSave={onSave}
            trigger={<Button primary icon="setting" content="Settings" />}
          />
        </Layout.Group>
      </Layout>
      <Menu pointing secondary>
        <Menu.Item
          name="Overview"
          to={`/videos/${video.id}`}
          as={NavLink}
          exact
        />
        <Menu.Item
          name="Player"
          to={`/videos/${video.id}/player`}
          as={NavLink}
          exact
        />
        <Menu.Item
          name="Status"
          to={`/videos/${video.id}/status`}
          as={NavLink}
          exact
        />
      </Menu>
    </React.Fragment>
  );
};
