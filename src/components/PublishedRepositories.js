import React, { useEffect, useState } from 'react';
import * as cmn from '../common';
import { Button, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './PublishedRepositories.scss';
import RepositoryElement from '../elements/RepositoryElement';

const tabs = [
  {
    title: 'Repositories',
    path: 'repositories',
  },
  {
    title: 'Collaborative Repositories',
    path: 'contributor-repositories',
  },
];
const PublishedRepositories = ({ pubkey, showButton, isLogged }) => {
  const [publishedRepositories, setPublishedRepositories] = useState([]);
  const [repositoriesByContributor, setRepositoriesByContributor] = useState(
    []
  );
  const [selectedTab, setSelectedTab] = useState('repositories');

  const fetchPublishedRepositories = async () => {
    const ndk = await cmn.getNDK();
    const addrForFilter = {
      kinds: [30117],
      authors: [pubkey],
    };
    const resultFetchAllEvents = await cmn.fetchAllEvents([
      cmn.startFetch(ndk, addrForFilter),
    ]);

    const repositoriesWithCounts =
      cmn.addContributionCounts(resultFetchAllEvents);
    setPublishedRepositories(repositoriesWithCounts);
  };

  const fetchRepositoriesByContributor = async () => {
    const ndk = await cmn.getNDK();
    const addrForFilter = {
      kinds: [30117],
      '#p': [pubkey],
    };
    const resultFetchAllEvents = await cmn.fetchAllEvents([
      cmn.startFetch(ndk, addrForFilter),
    ]);
    const repositoriesWithCounts =
      cmn.addContributionCounts(resultFetchAllEvents);
    setRepositoriesByContributor(repositoriesWithCounts);
  };

  useEffect(() => {
    fetchPublishedRepositories();
    fetchRepositoriesByContributor();
  }, []);

  const getUrl = (event) => {
    const viewUrl = '/r/' + cmn.getNaddr(event);
    return viewUrl;
  };

  const renderRepositories = (repositories) => {
    return (
      <ListGroup>
        {repositories?.length > 0 ? (
          repositories?.map((repo) => {
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
    );
  };

  const repositoriesByTab = {
    repositories: renderRepositories(publishedRepositories),
    ['contributor-repositories']: renderRepositories(repositoriesByContributor),
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
      <ul className="nav nav-pills d-flex  pb-4">
        {tabs.map((nav) => {
          return (
            <li
              onClick={() => {
                setSelectedTab(nav.path);
              }}
              className={`pointer nav-link nav-item ${
                selectedTab === nav.path ? 'active' : ''
              }`}
            >
              {nav.title}
            </li>
          );
        })}
      </ul>
      {repositoriesByTab[selectedTab]}
    </div>
  );
};

export default PublishedRepositories;
