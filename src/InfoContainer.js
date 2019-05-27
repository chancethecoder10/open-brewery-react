import React from 'react';

import {titleCaseToAbbrev} from './utils';
import './InfoContainer.css';

export default function InfoContainer(props) {
  if (!(props.brewery)) {
    return (
      <div className="info"></div>
    );
  }

  let {
    name,
    brewery_type,
    street,
    city,
    state,
    postal_code,
    phone,
    website_url,
    latitude,
    longitude,
    tag_list,
    updated_at
  } = props.brewery;

  let addr1 = street ? (
    <tr>
      <td>Address:</td>
      <td>{street}</td>
    </tr>
  ) : null;

  let addr2 =  street ? (
    <tr>
      <td></td>
      <td>{city},
        {titleCaseToAbbrev(state)}
        {postal_code}</td>
    </tr>
  ) : null;

  let num = phone ? (
    <tr>
      <td>Phone:</td>
      <td>{phone}</td>
    </tr>
  ) : null;

  let web = website_url ? (
    <tr>
      <td>URL:</td>
      <td><a href={website_url}>{website_url}</a></td>
    </tr>
  ) : null;

  let lat = latitude ? (
    <tr>
      <td>Latitude:</td>
      <td>{latitude}</td>
    </tr>
  ) : null;

  let lng = longitude ? (
    <tr>
      <td>Longitude:</td>
      <td>{longitude}</td>
    </tr>
  ) : null;

  let tags = tag_list && tag_list.length > 0 ? (
    <tr>
      <td>Tags:</td>
      <td>{tag_list.join(", ")}</td>
    </tr>
  ) : null;
  
  let updated = new Date(updated_at);
  let classes = props.visible ? "info selected" : "info";

  return (
    <div className={classes}>
      <div className="go-back" onClick={props.hide}>
        <span className="back-arrow"></span>
        <span>Back to search results</span>
      </div>
      <table>
        <tbody>
          <tr>
            <td colSpan="2"><h2>{name}</h2></td>
          </tr>
          <tr>
            <td>Type:</td>
            <td>{brewery_type}</td>
          </tr>
          {addr1}
          {addr2}
          {num}
          {web}
          {lat}
          {lng}
          {tags}
          <tr>
            <td>Updated:</td>
            <td>{updated.toLocaleDateString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
