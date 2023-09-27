import React, { useEffect, useState } from 'react';
import * as cmn from '../common';
import { Button, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './PublishedRepositories.scss';
import RepositoryElement from '../elements/RepositoryElement';

const PublishedRepositories = ({ pubkey, showButton, isLogged }) => {
  const [publishedRepositories, setPublishedRepositories] = useState([]);

  const fetchPublishedRepositories = async () => {
    const ndk = await cmn.getNDK();
    const addrForFilter = {
      kinds: [30117],
      authors: [pubkey],
    };
    const resultFetchAllEvents = await cmn.fetchAllEvents([
      cmn.startFetch(ndk, addrForFilter),
    ]);
    setPublishedRepositories(resultFetchAllEvents);
  };

  useEffect(() => {
    fetchPublishedRepositories();
  }, []);

  const getUrl = (event) => {
    const viewUrl = '/r/' + cmn.getNaddr(event);
    return viewUrl;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center pb-2">
        <h4>Published repositories:</h4>
        {isLogged && showButton ? (
          <div className="mt-2">
            <Link to={cmn.formatRepositoryEditUrl('')}>
              <Button variant="primary">Add repository</Button>
            </Link>
          </div>
        ) : null}
      </div>

      <ListGroup>
        {publishedRepositories.length > 0 ? (
          publishedRepositories?.map((repo) => {
            return <RepositoryElement repo={repo} getUrl={getUrl} />;
          })
        ) : (
          <span>Nothing yet.</span>
        )}
      </ListGroup>
    </div>
  );
};

export default PublishedRepositories;
