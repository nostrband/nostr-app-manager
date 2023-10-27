import React, { useState, useEffect } from 'react';
import * as cmn from '../../../common';
import RepositoryElement from '../../../elements/RepositoryElement';
import { ListGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../../../elements/LoadingSpinner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReposBySearchQuery } from '../../../redux/slices/resultSearchData-slice';

const RepositoriesBySearch = () => {
  const { searchValue } = useParams();
  const { repositories, loadingRepos: loading } = useSelector(
    (state) => state.searchResultData
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchReposBySearchQuery(searchValue));
  }, []);

  return (
    <div>
      <h3 className="mt-3 mb-3">
        Repositories on request:
        <span className="mx-1">{searchValue} </span>
      </h3>
      <ListGroup>
        {repositories?.map((repo) => {
          return (
            <RepositoryElement
              key={repo.id}
              repo={repo}
              getUrl={cmn.getRepositoryUrl}
              countContributions={repo.countContributions}
            />
          );
        })}
      </ListGroup>
      {!loading && repositories.length === 0 ? (
        <span> Nothing found </span>
      ) : null}
      {loading && repositories.length === 0 ? <LoadingSpinner /> : null}
    </div>
  );
};

export default RepositoriesBySearch;
