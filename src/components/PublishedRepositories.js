import React, { useEffect, useState } from 'react';
import * as cmn from '../common';
import { ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './PublishedRepositories.scss';
import GithubIcon from '../icons/Github';
import GitHubIconWithStar from '../elements/GitHubIconWithStar';
import RepositoryElement from '../elements/RepositoryElement';

const PublishedRepositories = ({ pubkey }) => {
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
      <h4 className="mt-5">Published repositories:</h4>
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
