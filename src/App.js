import React from 'react';
import axios from 'axios';

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
  let titlecase = state.split("_").map(s => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(" ");

  return (
    <option value={state}>{titlecase}</option>
  )
})

function toAbbreviation(state) {
  let s = state.toLowerCase().replace(" ", "_");
  return STATE_ABR[s];
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
        {street} {city}, {toAbbreviation(state)} {postal_code}
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
      mapCenter: null,
    };
  }

  handleClickSearch() {
    let state = this.state.state;
    let city = this.state.city;
    axios.get(`https://api.openbrewerydb.org/breweries?by_state=${state}&by_city=${city}`)
    .then(res => {
      let breweries = res.data;

      this.setState({
        ...this.state,
        breweries: breweries,
      });
    }).catch(e => {

    });
  }

  handleClickListItem(i) {
    let breweries = this.state.breweries;
    let selected =  i !== this.state.selected ? i : null;
    
    this.setState({
      ...this.state,
      selected: selected,
    });
  }

  render() {
    const breweries = this.state.breweries;
    const listItems = breweries ? breweries.map((brewery, index) => {
      return (
        <Brewery 
          brewery={brewery}
          selected={index === this.state.selected}
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
              <select value={this.state.state}>
                {US_STATES_OPTIONS}
              </select>
              <input placeholder="Search US Cities"></input>
              <button onClick={() => this.handleClickSearch()}>Search</button>
            </div>
            {results}
          </div>
          <div className="map">
            {/* TODO: add map */}
          </div>
        </div>
        <footer className="App-footer"></footer>
    </div>
  );
}
}

export default App;
