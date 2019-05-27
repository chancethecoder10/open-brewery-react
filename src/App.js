import React from 'react';
import axios from 'axios';

import MapContainer from './MapContainer.js';
import './App.css';

const STATE_ABR = {
  "alabama": "AL",
  "alaska": "AK",
  "arizona": "AZ",
  "arkansas": "AR",
  "california": "CA",
  "colorado": "CO",
  "connecticut": "CT",
  "delaware": "DE",
  "florida": "FL",
  "georgia": "GA",
  "hawaii": "HI",
  "idaho": "ID",
  "illinois": "IL",
  "indiana": "IN",
  "iowa": "IA",
  "kansas": "KS",
  "kentucky": "KY",
  "louisiana": "LA",
  "maine": "ME",
  "maryland": "MD",
  "massachusetts": "MA",
  "michigan": "MI",
  "minnesota": "MN",
  "mississippi": "MS",
  "missouri": "MO",
  "montana": "MT",
  "nebraska": "NE",
  "nevada": "NV",
  "new_hampshire": "NH",
  "new_jersey": "NJ",
  "new_mexico": "NM",
  "new_york": "NY",
  "north_carolina": "NC",
  "north_dakota": "ND",
  "ohio": "OH",
  "oklahoma": "OK",
  "oregon": "OR",
  "pennsylvania": "PA",
  "rhode_island": "RI",
  "south_carolina": "SC",
  "south_dakota": "SD",
  "tennessee": "TN",
  "texas": "TX",
  "utah": "UT",
  "vermont": "VT",
  "virginia": "VA",
  "washington": "WA",
  "west_virginia": "WV",
  "wisconsin": "WI",
  "wyoming": "WY",
}

const US_STATES_OPTIONS = Object.keys(STATE_ABR).map((state) => {
  let titlecase = urlToTitleCase(state);
  return (
    <option value={state} key={STATE_ABR[state]}>{titlecase}</option>
  )
})

function titleCaseToAbbrev(state) {
  let s = titleCaseToUrl(state);
  return STATE_ABR[s];
}

function urlToTitleCase(phrase) {
  return phrase.split("_").map(s => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(" ");
}

function titleCaseToUrl(phrase) {
  return phrase.toLowerCase().replace(" ", "_");
}

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
          key:      'AIzaSyB2k-ujf_xCCwW6swXlaE6o0yzYO-WUQsw',
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
    let breweries = this.state.breweries;
    let selected =  i !== this.state.selected ? i : null;
    
    let mapCenter;
    if (selected) {
      mapCenter = { lat: breweries[i].latitude, lng: breweries[i].longitude };
    } else {
      mapCenter = averagedCenter(breweries);
    }

    this.setState({
      ...this.state,
      selected: selected,
      mapCenter: mapCenter
    });
  }

  render() {
    const center = this.state.mapCenter;
    const selected = this.state.selected;
    const breweries = this.state.breweries;
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
        <header className="App-header"></header>
        <div className="App-body">
          <div className="breweries">
            <div className="search">
              <select defaultValue={this.state.state}>
                {US_STATES_OPTIONS}
              </select>
              <input placeholder="Search US Cities"></input>
              <button onClick={() => this.handleClickSearch()}>Search</button>
            </div>
            {results}
          </div>
          <div className="map">
            <MapContainer
              breweries={breweries}
              selected={selected}
              center={center}
            />
          </div>
        </div>
        <footer className="App-footer"></footer>
      </div>
    );
  }
}

export default App;
