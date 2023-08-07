import React, { useState, useEffect } from 'react';
import * as cmn from '../../common';
import { ListGroup } from 'react-bootstrap';
import RepositoryElement from '../../elements/RepositoryElement';

const Repositories = () => {
  const [allRepositories, setAllRepositories] = useState([]);

  const fetchPublishedRepositories = async () => {
    const ndk = await cmn.getNDK();
    const addrForFilter = {
      kinds: [30117],
      limit: 100,
    };
    const resultFetchAllEvents = await cmn.fetchAllEvents([
      cmn.startFetch(ndk, addrForFilter),
    ]);
    setAllRepositories(resultFetchAllEvents);
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
      <h4>Repositories:</h4>
      <ListGroup>
        {allRepositories.length > 0 ? (
          allRepositories?.map((repo) => {
            return <RepositoryElement repo={repo} getUrl={getUrl} />;
          })
        ) : (
          <span>Nothing yet.</span>
        )}
      </ListGroup>
    </div>
  );
};

export default Repositories;
