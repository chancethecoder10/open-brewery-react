import React from 'react';
import axios from 'axios';

import MapContainer from './MapContainer';
import InfoContainer from './InfoContainer';
import './App.css';

import {API_KEY, US_STATES_OPTIONS, titleCaseToAbbrev} from './utils';

function averagedCenter(breweries) {
  let filtered = breweries.filter(b => b.latitude && b.longitude);
  let center = filtered.reduce((prevVal, currVal) => {
    let lat = parseFloat(currVal.latitude);
    let lng = parseFloat(currVal.longitude);
    prevVal.lat = prevVal.lat ? prevVal.lat + lat : lat;
    prevVal.lng = prevVal.lng ? prevVal.lng + lng : lng;
    return prevVal;
  }, {});

  center.lat /= filtered.length;
  center.lng /= filtered.length;

  return center;
}

function Brewery(props) {
  let {
    name,
    brewery_type,
    street,
    city,
    state,
    postal_code,
    website_url,
  } = props.brewery;
  let selected = props.selected;

  return (
    <li className={selected ? " selected" : ""} onClick={props.onClick}>
      <div className="header">
        <div className="name">{name}</div>
        <div className="type">{brewery_type}</div>
      </div>
      <div>
        {street} {city}, {titleCaseToAbbrev(state)} {postal_code}
      </div>
      <div>
        <a href={website_url}>{website_url}</a>
      </div>
    </li>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      state: "pennsylvania",
      city: "harrisburg",
      breweries: null,
      selected: null,
      showInfo: false,
      mapCenter: {
        lat:  40.264441,  // PA state capitol for lulz
        lng: -76.883624
      },
    };

    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = pos.coords;

        this.setState({
          ...this.state,
          mapCenter: {
            lat: coords.latitude,
            lng: coords.longitude
          }
        })
      })
    }
  }

  fixBreweries(breweries) {
    // Create a series of promises to fix each brewery that
    // does not currently have a latitude or longitude, but
    // does have a street address. 
    // This doesn't actually work because I don't feel like
    // paying for the Geocoding API...
    let promises = breweries.filter(b => b.street && (!(b.latitude) || !(b.longitude))).map(b => {
      return axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
          key:      API_KEY,
          address:  `${b.street} ${b.city}, ${titleCaseToAbbrev(b.state)}`
        }
      }).then(res => {
        let result = res.data.results[0];
        if (result) {
          let {lat, lng} = result.geometry.location;
          b.latitude = lat;
          b.longitude = lng;
        }
      }).catch(e => {

      });
    });

    // Resolve all promises and update the state. This works
    // even if the above is denied by Google.
    axios.all(promises)
    .then(res => {
      let mapCenter = averagedCenter(breweries);
      this.setState({
        ...this.state,
        breweries: breweries,
        mapCenter: mapCenter,
      });
    });
  }

  handleClickSearch() {
    let state = this.state.state;
    let city = this.state.city;
    axios.get(`https://api.openbrewerydb.org/breweries?by_state=${state}&by_city=${city}`)
    .then(res => {
      // Remove breweries that only exist on paper, and try to get
      // the latitude and longitude for breweries that lack them.
      let breweries = res.data.filter(brewery => brewery.street);
      this.fixBreweries(breweries);
    }).catch(e => {

    });
  }

  handleClickListItem(i) {
    if (!this.state.showInfo && this.state.selected === i) {
      this.setState({
        ...this.state,
        showInfo: true
      });
      return;
    }

    let breweries = this.state.breweries;
    let selected =  i !== this.state.selected ? i : null;

    let mapCenter;
    if (selected !== null) {
      mapCenter = { lat: breweries[i].latitude, lng: breweries[i].longitude };
    } else {
      mapCenter = averagedCenter(breweries);
    }

    this.setState({
      ...this.state,
      selected: selected,
      showInfo: true,
      mapCenter: mapCenter
    });
  }

  handleHideInfo() {
    this.setState({
      ...this.state,
      showInfo: false
    });
  }

  handleChangeState(e) {
    this.setState({
      ...this.state,
      state: e.target.value
    })
  }

  handleChangeCity(e) {
    this.setState({
      ...this.state,
      city: e.target.value
    })
  }

  render() {
    const {
      mapCenter,
      selected,
      showInfo,
      breweries,
      state,
      city
    } = this.state;

    const selectedBrewery = breweries && selected !== null ? breweries[selected] : null;

    const listItems = breweries ? breweries.map((brewery, index) => {
      return (
        <Brewery 
          key={index}
          brewery={brewery}
          selected={index === selected}
          onClick={() => this.handleClickListItem(index)}
        />
      );
    }) : [];

    const results = breweries ? 
      breweries.length > 0 ? <ol>{listItems}</ol> 
                           : <div className="message">No breweries found</div> 
      : <div className="message">Enter state and city to find breweries</div>

    return (
      <div className="App">
        <header className="App-header">open-brewery-react</header>
        <div className="App-body">
          <div className="breweries">
            <div className="search">
              <select value={state} onChange={(e) => this.handleChangeState(e)}>
                {US_STATES_OPTIONS}
              </select>
              <input placeholder="Search US Cities" value={city} onChange={(e) => this.handleChangeCity(e)}></input>
              <button onClick={() => this.handleClickSearch()}>Search</button>
            </div>
            {results}
            <InfoContainer 
              brewery={selectedBrewery}
              visible={showInfo}
              hide={() => this.handleHideInfo()}
            />
          </div>
          <div className="map">
            <MapContainer
              breweries={breweries}
              center={mapCenter}
              onClick={(i) => this.handleClickListItem(i)}
            />
          </div>
        </div>
        <footer className="App-footer">Copyright &copy; 2019 M Matthew Hydock</footer>
      </div>
    );
  }
}

export default App;
