import React from 'react';
import { Search } from 'react-bootstrap-icons';
import { Button } from 'react-bootstrap';
import { isTablet } from '../const';

const SearchButton = ({ onClick, children }) => {
  return (
    <Button
      onClick={onClick}
      className="search-button"
      variant="outline-secondary"
    >
      <Search />
      {!isTablet ? <span>{children}</span> : null}
    </Button>
  );
};

export default SearchButton;
