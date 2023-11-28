import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import './SearchApp.scss';
import SearchButton from '../elements/SearchButton';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  const navigate = useNavigate();

  const searchAppsAndRepositories = (event) => {
    event.preventDefault();
    dispatch(clearSearchResults());
    dispatch(fetchAppsBySearchQuery(searchTerm));
    dispatch(fetchReposBySearchQuery(searchTerm));
    navigate(`/search/${searchTerm}`);
  };

  return (
    <form onSubmit={searchAppsAndRepositories}>
      <div className="search-field-container">
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
        <Link onClick={searchAppsAndRepositories} to={`/search/${searchTerm}`}>
          <SearchButton>Search</SearchButton>
        </Link>
      </div>
    </form>
  );
};

export default SearchApp;
