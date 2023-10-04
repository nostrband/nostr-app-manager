import React, { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import * as cmn from '../../common';
import LoadingSpinner from '../../elements/LoadingSpinner';
import ApplicationItem from '../ApplicationItem';
import { useAuth } from '../../context/AuthContext';
import { generateAddr } from '../../common';
import { useAppState } from '../../context/AppContext';
import { categories, categoriesTabMainPage } from '../../const';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';

const NewApps = () => {
  const { pubkey } = useAuth();
  const { category: categoryUrl, activeCategory, activePage } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {
    appListState,
    setAppListState,
    empty,
    setEmpty,
    setAppsLoaded,
    appsLoaded,
    clearApps,
  } = useAppState();
  const {
    allApps,
    loading,
    scrollPosition,
    appAddrs,
    appCountsState,
    hasMore,
    lastCreatedAt,
    followedPubkeys,
  } = appListState;

  useEffect(() => {
    if (categoryUrl) {
      window.scrollTo({ top: scrollPosition, behavior: 'instant' });
    }
  }, []);

  useEffect(() => {
    setEmpty(false);
  }, [pathname]);

  const updateState = (changes) => {
    setAppListState((prevState) => ({ ...prevState, ...changes }));
  };

  const fetchApps = async (created_at) => {
    console.log('DONE FETCH APPS');
    updateState({ loading: true });
    try {
      let category;
      if (categoryUrl && categoryUrl !== 'all') {
        category = categoryUrl;
      } else if (activeCategory) {
        category = activeCategory;
      }
      const info = await cmn.fetchAppsByKinds(
        null,
        categoryUrl ? created_at : undefined,
        'MAIN_PAGE',
        category
      );
      console.log(info, 'INFO');
      const newAppsData = [];
      for (const name in info.apps) {
        const app = info.apps[name].handlers[0];
        newAppsData.push(app);
      }

      const currentApps = appListState.allApps;
      console.log(currentApps, 'CURRENT APPS');
      if (newAppsData.length > 0) {
        const filteredApps = newAppsData.filter(
          (newApp) =>
            !currentApps.some((existingApp) => existingApp.id === newApp.id)
        );
        if (filteredApps.length === 0) {
          setEmpty(true);
        }

        console.log(filteredApps, 'FILTERED APPS');

        updateState({
          allApps: [...currentApps, ...filteredApps],
          lastCreatedAt:
            filteredApps.length > 0
              ? filteredApps[filteredApps.length - 1].created_at
              : undefined,
          appAddrs: [
            ...appListState.appAddrs,
            ...filteredApps.map((app) => cmn.generateAddr(app)),
          ],
        });
      } else {
        updateState({ hasMore: false });
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleScroll = () => {
    console.log({ loading: !loading, hasMore, lastCreatedAt, empty: !empty });
    if (!loading && hasMore && lastCreatedAt) {
      const scrollBottom = Math.abs(
        document.documentElement.scrollHeight -
          (window.innerHeight + document.documentElement.scrollTop)
      );
      updateState({ scrollPosition: window.scrollY });
      if (scrollBottom < 10 && !empty) {
        fetchApps(lastCreatedAt);
      }
    }
  };

  useEffect(() => {
    if (!appsLoaded) {
      updateState({
        allApps: [],
        lastCreatedAt: null,
        appAddrs: [],
        category: categoryUrl,
        hasMore: true,
      });
      if (allApps.length > 0) {
        fetchApps(lastCreatedAt);
      } else {
        fetchApps(null);
      }
      setAppsLoaded(true);
    }
  }, [categoryUrl, activeCategory]);

  const fetchAppsByCategory = (activeTab) => {
    clearApps();
    navigate(`/apps/category/${activeTab}`);
  };
  const setActiveCategoryInMainPage = (nav) => {
    clearApps();
    navigate(`/main/${activePage}/${nav}`);
  };

  useEffect(() => {
    if (categoryUrl) {
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [hasMore, loading, lastCreatedAt]);

  useEffect(() => {
    const fetchFollowedPubkeys = async () => {
      const ndk = await cmn.getNDK();
      if (pubkey) {
        try {
          const filter = {
            kinds: [3],
            authors: [pubkey],
          };
          const events = await cmn.fetchAllEvents([
            cmn.startFetch(ndk, filter),
          ]);
          const pubkeys = events.flatMap((event) =>
            event.tags.filter((tag) => tag[0] === 'p').map((tag) => tag[1])
          );
          updateState({ followedPubkeys: pubkeys });
        } catch (error) {
          console.error('Error fetching user contacts:', error);
        }
      }
    };
    fetchFollowedPubkeys();
  }, [pubkey]);

  useEffect(() => {
    const fetchRecommendedApps = async () => {
      const ndk = await cmn.getNDK();
      if (appAddrs?.length > 0) {
        const filter = pubkey
          ? {
              kinds: [31989],
              '#a': appAddrs,
              authors: followedPubkeys,
              limit: 100,
            }
          : { kinds: [31989], '#a': appAddrs, limit: 100 };
        const recommendedApps = await cmn.fetchAllEvents([
          cmn.startFetch(ndk, filter),
        ]);

        const appUsers = {};
        recommendedApps.forEach((recommendedApp) => {
          const appAddrTags = recommendedApp.tags.filter(
            (tag) => tag[0] === 'a'
          );
          appAddrTags.forEach((tag) => {
            const addr = tag[1];

            if (!appUsers[addr]) {
              appUsers[addr] = new Set();
            }
            appUsers[addr].add(recommendedApp.pubkey);
          });
        });
        const appCounts = {};
        for (const [addr, userSet] of Object.entries(appUsers)) {
          appCounts[addr] = userSet.size;
        }
        updateState({ appCountsState: appCounts });
      }
    };
    fetchRecommendedApps();
  }, [appAddrs, followedPubkeys]);

  return (
    <div>
      <Container className="ps-0 pe-0">
        <h2>Nostr apps</h2>
        {categoryUrl ? (
          <div className="d-flex justify-content-center pt-2 pb-3">
            <ul className="nav nav-pills d-flex justify-content-center ">
              <li
                onClick={() => fetchAppsByCategory('all')}
                className={`pointer nav-link nav-item ${
                  categoryUrl === 'all' ? 'active' : ''
                }`}
              >
                All
              </li>
              {categories.map((nav) => {
                return (
                  <li
                    onClick={() => fetchAppsByCategory(nav.value)}
                    className={`pointer nav-link nav-item ${
                      categoryUrl === nav.value ? 'active' : ''
                    }`}
                  >
                    {nav.label}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="d-flex justify-content-center pt-2 pb-3">
            <ul className="nav nav-pills d-flex justify-content-center ">
              {categoriesTabMainPage.map((nav) => {
                return (
                  <li
                    onClick={() => setActiveCategoryInMainPage(nav.value)}
                    className={`pointer nav-link nav-item ${
                      activeCategory === nav.value ? 'active' : ''
                    }`}
                  >
                    {nav.label}
                  </li>
                );
              })}
              <Link to="/apps/category/all">
                <li onClick={clearApps} className="pointer nav-link nav-item">
                  Other
                </li>
              </Link>
            </ul>
          </div>
        )}
        <Row>
          <Col>
            {allApps.length === 0 && !loading && 'Nothing found on relays.'}
            <div className="container-apps">
              {allApps
                ?.slice(
                  activeCategory && activePage && !categoryUrl ? 0 : undefined,
                  activeCategory && activePage && !categoryUrl ? 6 : undefined
                )
                .map((app) => {
                  const appAddr = generateAddr(app);
                  return (
                    <div key={app.id}>
                      <ApplicationItem
                        pubkey={pubkey}
                        count={appCountsState[appAddr] || 0}
                        app={app}
                      />
                    </div>
                  );
                })}
            </div>
            {loading && !empty && !activeCategory && !activePage && (
              <LoadingSpinner />
            )}
            {loading &&
              allApps.length === 0 &&
              activeCategory &&
              activeCategory && <LoadingSpinner />}
          </Col>
        </Row>
      </Container>
      {allApps.length > 0 && !categoryUrl ? (
        <Link to="/apps/category/all">
          <button
            onClick={clearApps}
            type="button"
            class="btn btn-primary show-more-button"
          >
            More Nostr apps
          </button>
        </Link>
      ) : null}
    </div>
  );
};

export default NewApps;
