import React, { Component } from 'react';
import { Map, Marker, GoogleApiWrapper } from 'google-maps-react';

import {API_KEY} from './utils';
import './MapContainer.css';

export class MapContainer extends Component {
  renderMarkers(breweries, onClick) {
    return breweries ? breweries.map((brewery, index) => {
      return (
        <Marker
          key={index}
          name={brewery.name}
          position={{lat: brewery.latitude, lng: brewery.longitude}}
          onClick={() => onClick(index)}
        />
      );
    }) : null;
  }

  render() {
    let markers = this.renderMarkers(this.props.breweries, this.props.onClick);
    let center = this.props.center ? {
      lat: this.props.center.lat,
      lng: this.props.center.lng
    } : null;

    return (
      <Map
        google={this.props.google}
        zoom={14}
        className="map"
        initialCenter={center}
      >
        {markers}
      </Map>
    );
  }
}

export default GoogleApiWrapper((props) => {
  return {
    ...props,
    apiKey: API_KEY
  }
})(MapContainer);