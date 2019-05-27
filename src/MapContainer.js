import React, { Component } from 'react';
import { InfoWindow, Map, Marker, GoogleApiWrapper } from 'google-maps-react';
import './MapContainer.css';

export class MapContainer extends Component {
  renderMarkers(breweries) {
    return breweries ? breweries.map((brewery, index) => {
      return (
        <Marker
          key={index}
          name={brewery.name}
          position={{lat: brewery.latitude, lng: brewery.longitude}}
        />
      );
    }) : null;
  }

  render() {
    let selected = this.props.selected;
    let markers = this.renderMarkers(this.props.breweries);
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
        <InfoWindow 
          marker={selected ? markers[selected] : null}
          visible={selected !== null}
        >
          <div></div>
        </InfoWindow>
      </Map>
    );
  }
}

export default GoogleApiWrapper((props) => {
  return {
    ...props,
    apiKey: 'AIzaSyB2k-ujf_xCCwW6swXlaE6o0yzYO-WUQsw'
  }
})(MapContainer);