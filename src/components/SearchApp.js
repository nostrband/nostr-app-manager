import React, { useState, useEffect, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from 'lodash';
import * as cmn from '../common';
import SearchIcon from '../icons/Search';
import InputAdornment from '@mui/material/InputAdornment';
import './SearchApp.scss';
import SearchOptionAppElement from './SearchOptionAppElement';
import LoadingSpinner from '../elements/LoadingSpinner';

const SearchApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);

  const transformData = (data) => {
    return {
      id: data.id,
      name: JSON.parse(data.content).name,
      picture: JSON.parse(data.content).picture,
      app: data,
    };
  };
  const getAppsBySearchQuery = async (searchValue) => {
    const ndk = await cmn.getNDK();
    setLoading(true);
    try {
      const filter = { kinds: [31990], search: searchValue };
      let rawResult = await cmn.fetchAllEvents([cmn.startFetch(ndk, filter)]);
      let result = rawResult.map(transformData);
      setOptions(result);
    } catch (error) {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };
  console.log(loading, 'LOADING');
  const searchFunction = useCallback(
    debounce((query) => {
      getAppsBySearchQuery(query);
    }, 500),
    []
  );

  useEffect(() => {
    if (searchTerm) {
      searchFunction(searchTerm);
    }
    return () => searchFunction.cancel();
  }, [searchTerm, searchFunction]);

  return (
    <div className="search-field-container w-100">
      <Autocomplete
        open={isOpen}
        loading={loading}
        loadingText={<LoadingSpinner removeSpace />}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        options={options}
        noOptionsText="Sorry, nothing was found."
        getOptionLabel={(option) => option.name}
        renderOption={(props, option) => (
          <li {...props}>
            <SearchOptionAppElement option={option} />
          </li>
        )}
        value={selectedOption}
        onChange={(event, newValue) => setSelectedOption(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            size="small"
            variant="outlined"
            value={selectedOption ? selectedOption.name : searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedOption(null);
            }}
            placeholder="Search..."
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment style={{ margin: '0 5px' }} position="start">
                    <SearchIcon />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </div>
  );
};

export default SearchApp;
