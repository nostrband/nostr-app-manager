import React from 'react';
import './SearchApp.scss';
import * as cmn from '../common';
import { Link } from 'react-router-dom';
import defaultImage from '../images/default.png';

const SearchOptionAppElement = ({ option }) => {
  const getUrl = (h) => cmn.formatAppUrl(cmn.getNaddr(h));
  return (
    <Link className="option-element" to={option.app ? getUrl(option.app) : ''}>
      {option.picture ? (
        <img className="app-logo-option" src={option.picture} />
      ) : (
        <div className="default-image-option">
          <img src={defaultImage} />
        </div>
      )}
      <span>{option.name}</span>
    </Link>
  );
};

export default SearchOptionAppElement;
