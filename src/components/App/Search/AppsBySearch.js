import React, { useState, useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../../../elements/LoadingSpinner';
import AppSelectItem from '../../../elements/AppSelectItem';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppsBySearchQuery } from '../../../redux/slices/resultSearchData-slice';

const AppsBySearch = () => {
  const { searchValue } = useParams();
  const { apps, loadingApps: loading } = useSelector(
    (state) => state.searchResultData
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAppsBySearchQuery(searchValue));
  }, []);

  return (
    <div>
      <h3 className="mt-3 mb-3">
        Apps on request:<span className="mx-1">{searchValue} </span>
      </h3>
      <ListGroup>
        {apps.map((app) => {
          const profile = app?.content ? JSON.parse(app.content) : {};
          return (
            <AppSelectItem
              pubkey={app.pubkey}
              key={app.id}
              app={{ ...app, profile }}
            />
          );
        })}
      </ListGroup>
      {!loading && apps.length === 0 ? <span> Nothing found, try Repositories </span> : null}
      {loading && apps.length === 0 ? <LoadingSpinner /> : null}
    </div>
  );
};

export default AppsBySearch;
