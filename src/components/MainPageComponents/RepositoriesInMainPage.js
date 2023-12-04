import React, { useState, useEffect } from 'react';
import * as cmn from '../../common';
import { Container, ListGroup } from 'react-bootstrap';
import RepositoryElement from '../../elements/RepositoryElement';
import LoadingSpinner from '../../elements/LoadingSpinner';
import { Link, useLocation, useParams } from 'react-router-dom';
import { mainDataActions } from '../../redux/slices/mainData-slice';
import { useSelector, useDispatch } from 'react-redux';

const Repositories = ({ main }) => {
  const { pathname } = useLocation();
  const onTheMainPage = pathname === '/';
  const dispatch = useDispatch();
  const repositoriesData = useSelector(
    (state) => state.mainData.repositoriesData
  );
  const { repos: allRepositories, last_created_at: lastCreatedAt } =
    repositoriesData;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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
        const filteredRepositories = resultFetchAllEvents
          .filter(
            (newRepo) =>
              !allRepositories.some(
                (existingRepo) => existingRepo.id === newRepo.id
              )
          )
          .sort((a, b) => b.created_at - a.created_at);

        if (filteredRepositories.length === 0) {
          dispatch(mainDataActions.setEmpty());
        }

        const addContributionCounts = (repositories) => {
          return repositories.map((repo) => {
            const zapValues = (repo.tags || []).filter(
              (tag) => tag[0] === 'zap'
            );
            const sumForRepo = zapValues.reduce(
              (sum, zap) => sum + (Number(zap[3]) || 0),
              0
            );
            return {
              ...repo,
              countContributions: sumForRepo,
            };
          });
        };

        const repositoriesWithCounts =
          addContributionCounts(filteredRepositories);

        dispatch(
          mainDataActions.setRepos({
            repos: repositoriesWithCounts,
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
      if (scrollBottom < 10 && !allRepositories.empty) {
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
      <div className={`pb-2 ${main ? 'pt-5' : ''}`}>
        <h2>Code repositories</h2>
        <ListGroup className="mb-3">
          {allRepositories.length > 0
            ? allRepositories
                ?.slice(
                  onTheMainPage ? 0 : undefined,
                  onTheMainPage ? 4 : undefined
                )
                .map((repo) => {
                  return (
                    <RepositoryElement
                      key={repo.id}
                      repo={repo}
                      getUrl={cmn.getRepositoryUrl}
                      countContributors={repo.countContributors}
                      countContributions={repo.countContributions}
                    />
                  );
                })
            : null}
        </ListGroup>
        {loading && !allRepositories.empty && !onTheMainPage && (
          <LoadingSpinner />
        )}
        {loading && allRepositories.length === 0 && onTheMainPage && (
          <LoadingSpinner />
        )}
        {!loading && allRepositories.length === 0 ? (
          <span>Nothing yet.</span>
        ) : null}
        {allRepositories.length > 0 && onTheMainPage ? (
          <Link to="/repos">
            <button
              type="button"
              class="more-button btn btn-outline-primary show-more-button"
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
