import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import './SearchApp.scss';
import SearchButton from '../elements/SearchButton';
import { Link, useParams } from 'react-router-dom';
import {
  fetchAppsBySearchQuery,
  resultSearchActions,
  fetchReposBySearchQuery,
} from '../redux/slices/resultSearchData-slice';
import { clearSearchResults } from '../redux/slices/resultSearchData-slice';
import { useDispatch } from 'react-redux';

const SearchApp = () => {
  const { searchValue } = useParams();
  const [searchTerm, setSearchTerm] = useState(searchValue);
  const dispatch = useDispatch();

  const searchDataOrClear = () => {
    dispatch(clearSearchResults());
    dispatch(fetchAppsBySearchQuery(searchTerm));
    dispatch(fetchReposBySearchQuery(searchTerm));
  };

  return (
    <div className="search-field-container w-100">
      <TextField
        fullWidth
        size="small"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
        placeholder="Search..."
      />
      <Link onClick={searchDataOrClear} to={`/search/${searchTerm}`}>
        <SearchButton>Search</SearchButton>
      </Link>
    </div>
  );
};

export default SearchApp;
