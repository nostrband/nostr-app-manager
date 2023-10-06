import React, { useState, useEffect } from 'react';
import * as cmn from '../../common';
import { Container, ListGroup } from 'react-bootstrap';
import RepositoryElement from '../../elements/RepositoryElement';
import LoadingSpinner from '../../elements/LoadingSpinner';
import { Link, useParams } from 'react-router-dom';
import { mainDataActions } from '../../redux/slices/mainData-slice';
import { useSelector, useDispatch } from 'react-redux';

const Repositories = () => {
  const { activePage } = useParams();
  const dispatch = useDispatch();
  const { repositoriesData } = useSelector((state) => state.mainData);
  const { repos: allRepositories, last_created_at: lastCreatedAt } =
    repositoriesData;

  const [loading, setLoading] = useState(false);
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

        dispatch(
          mainDataActions.setRepos({
            repos: filteredRepositories,
            last_created_at:
              filteredRepositories[filteredRepositories.length - 1].created_at,
          })
        );
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

  return (
    <Container className="ps-0 pe-0">
      <div className="pb-2 pt-5">
        <h2>Code repositories</h2>
        <ListGroup className="mb-3">
          {allRepositories.length > 0
            ? allRepositories
                ?.slice(activePage ? 0 : undefined, activePage ? 4 : undefined)
                .map((repo) => {
                  return (
                    <RepositoryElement
                      key={repo.id}
                      repo={repo}
                      getUrl={cmn.getRepositoryUrl}
                    />
                  );
                })
            : null}
        </ListGroup>
        {loading && !empty && !activePage && <LoadingSpinner />}
        {loading && allRepositories.length === 0 && activePage && (
          <LoadingSpinner />
        )}
        {!loading && allRepositories.length === 0 ? (
          <span>Nothing yet.</span>
        ) : null}
        {allRepositories.length > 0 && activePage ? (
          <Link to="/repos">
            <button
              type="button"
              class="btn btn-outline-primary show-more-button"
            >
              More code repositories &rarr;
            </button>
          </Link>
        ) : null}
      </div>
    </Container>
  );
};

export default Repositories;
