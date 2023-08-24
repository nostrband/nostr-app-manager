import React from 'react';
import './SearchApp.scss';
import * as cmn from '../common';
import { Link } from 'react-router-dom';

const SearchOptionAppElement = ({ option }) => {
  console.log(option, 'OPTION');
  const getUrl = (h) => cmn.formatAppUrl(cmn.getNaddr(h));
  return (
    <Link className="option-element" to={option.app ? getUrl(option.app) : ''}>
      <img className="app-logo-option" src={option.picture} />
      <span>{option.name}</span>
    </Link>
  );
};

export default SearchOptionAppElement;
