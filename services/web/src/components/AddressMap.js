import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import styled from 'styled-components';
import { Transition } from 'semantic-ui-react';
import { GOOGLE_API_KEY } from 'utils/env';

const StyledMarker = styled.div`
  color: #fff;
  background: #1478c1;
  border-radius: 50%;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Marker = (props) => (
  <Transition visible={props.visible} animation="browse" duration={500}>
    <StyledMarker {...props} />
  </Transition>
);

function createOptions() {
  return {
    fullscreenControl: false,
  };
}

class Map extends Component {
  state = {
    visible: false,
  };
  static defaultProps = {
    label: 'Address',
    height: '200px',
    zoom: 10,
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({ visible: true });
    }, 400);
  }

  render() {
    const { height, zoom, address } = this.props;
    let currentZoom = zoom;
    const center = {
      lat: 44.967243,
      lng: -103.771556,
    };
    if (address.geoLocation && address.geoLocation.coordinates.length) {
      center.lat = address.geoLocation.coordinates[1];
      center.lng = address.geoLocation.coordinates[0];
    } else {
      currentZoom = 2;
    }
    return (
      <div
        style={{
          height,
          width: '100%',
          marginBottom: '0.5em',
          marginTop: '0.5em',
        }}>
        <GoogleMapReact
          options={createOptions}
          bootstrapURLKeys={{ key: GOOGLE_API_KEY }}
          defaultCenter={center}
          defaultZoom={currentZoom}>
          {[address]
            .filter((a) => a.geoLocation && a.geoLocation.coordinates.length)
            .map((address, i) => {
              return (
                <Marker
                  key={i}
                  lat={address.geoLocation.coordinates[1]}
                  lng={address.geoLocation.coordinates[0]}
                  visible={this.state.visible}
                />
              );
            })}
        </GoogleMapReact>
      </div>
    );
  }
}

export default Map;
