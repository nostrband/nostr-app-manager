import React from 'react';
import { Search } from 'react-bootstrap-icons';
import { Button } from 'react-bootstrap';
import '../components/Header.scss';

const SearchButton = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="search-button"
      variant="outline-secondary"
    >
      <Search />
    </Button>
  );
};

export default SearchButton;
