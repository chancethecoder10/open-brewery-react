import React from 'react';

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

export {US_STATES_OPTIONS, titleCaseToAbbrev, urlToTitleCase, titleCaseToUrl}