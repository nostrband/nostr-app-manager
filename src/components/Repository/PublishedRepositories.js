import React, { useEffect, useState } from 'react';
import * as cmn from '../../common';
import { Button, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './PublishedRepositories.scss';
import RepositoryElement from '../../elements/RepositoryElement';
import LoadingSpinner from '../../elements/LoadingSpinner';

const PublishedRepositories = ({ title, filter, showButton, isLogged }) => {
  const [publishedRepositories, setPublishedRepositories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPublishedRepositories = async () => {
    setLoading(true);
    try {
      const ndk = await cmn.getNDK();
      const resultFetchAllEvents = await cmn.fetchAllEvents([
        cmn.startFetch(ndk, filter),
      ]);
      const repositoriesWithCounts =
        cmn.addContributionCounts(resultFetchAllEvents);
      setPublishedRepositories(repositoriesWithCounts);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishedRepositories();
  }, [filter]);

  const getUrl = (event) => {
    const viewUrl = '/r/' + cmn.getNaddr(event);
    return viewUrl;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center pb-2">
        <h4>{title}:</h4>
        {isLogged && showButton ? (
          <div className="mt-2">
            <Link to={cmn.formatRepositoryEditUrl('')}>
              <Button variant="primary">Add repository</Button>
            </Link>
          </div>
        ) : null}
      </div>

      <ListGroup>
        {loading ? (
          <LoadingSpinner />
        ) : publishedRepositories?.length > 0 ? (
          publishedRepositories?.map((repo) => {
            return (
              <RepositoryElement
                countContributions={repo.countContributions}
                repo={repo}
                getUrl={getUrl}
              />
            );
          })
        ) : (
          <span>Nothing yet.</span>
        )}
      </ListGroup>
    </div>
  );
};

export default PublishedRepositories;
