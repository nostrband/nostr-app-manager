import React, { useState, useEffect } from 'react';
import * as cmn from '../../common';
import { ListGroup } from 'react-bootstrap';
import RepositoryElement from '../../elements/RepositoryElement';
import LoadingSpinner from '../../elements/LoadingSpinner';

const Repositories = () => {
  const [allRepositories, setAllRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastCreatedAt, setLastCreatedAt] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [empty, setEmpty] = useState(false);

  const fetchPublishedRepositories = async (created_at) => {
    setLoading(true);
    const ndk = await cmn.getNDK();
    const addrForFilter = {
      kinds: [30117],
      limit: 10,
      ...(created_at ? { until: created_at } : {}),
    };

    try {
      const resultFetchAllEvents = await cmn.fetchAllEvents([
        cmn.startFetch(ndk, addrForFilter),
      ]);
      if (resultFetchAllEvents.length > 0) {
        const filteredRepositories = resultFetchAllEvents.filter(
          (newRepo) =>
            !allRepositories.some(
              (existingRepo) => existingRepo.id === newRepo.id
            )
        );
        if (filteredRepositories.length === 0) {
          setEmpty(true);
        }
        setLastCreatedAt(
          filteredRepositories[filteredRepositories.length - 1].created_at
        );
        setAllRepositories((prev) => [...prev, ...filteredRepositories]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishedRepositories();
  }, []);

  const handleScroll = () => {
    if (!loading && hasMore && lastCreatedAt) {
      const scrollBottom = Math.abs(
        document.documentElement.scrollHeight -
          (window.innerHeight + document.documentElement.scrollTop)
      );
      if (scrollBottom < 10 && !empty) {
        fetchPublishedRepositories(lastCreatedAt);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loading, lastCreatedAt]);

  const getUrl = (event) => {
    const viewUrl = '/r/' + cmn.getNaddr(event);
    return viewUrl;
  };

  return (
    <div>
      <h3>Repositories:</h3>
      <ListGroup>
        {allRepositories.length > 0 ? (
          allRepositories?.map((repo) => {
            return (
              <RepositoryElement key={repo.id} repo={repo} getUrl={getUrl} />
            );
          })
        ) : (
          <span>Nothing yet.</span>
        )}
      </ListGroup>
      {loading && !empty && <LoadingSpinner />}
    </div>
  );
};

export default Repositories;
