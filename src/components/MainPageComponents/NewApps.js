import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import * as cmn from '../../common';
import LoadingSpinner from '../../elements/LoadingSpinner';
import ApplicationItem from '../ApplicationItem';
import { useAuth } from '../../context/AuthContext';
import { generateAddr } from '../../common';
import { useAppState } from '../../context/AppContext';
import { categories, categoriesTabMainPage } from '../../const';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { mainDataActions } from '../../redux/slices/mainData-slice';

const NewApps = () => {
  const { pubkey } = useAuth();
  const { category: categoryUrl, activeCategory, activePage } = useParams();
  const { apps: appsForMain } = useSelector((state) => state.mainData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    appListState,
    setAppListState,
    empty,
    setEmpty,
    setAppsLoaded,
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

  const updateState = (changes) => {
    setAppListState((prevState) => ({ ...prevState, ...changes }));
  };

  const fetchApps = async (created_at) => {
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
      const newAppsData = [];
      for (const name in info.apps) {
        const app = info.apps[name].handlers[0];
        newAppsData.push(app);
      }
      const currentApps = appListState.allApps;
      if (newAppsData.length > 0) {
        const filteredApps = newAppsData.filter(
          (newApp) =>
            !currentApps.some((existingApp) => existingApp.id === newApp.id)
        );
        if (filteredApps.length > 0) {
          const lastApp = filteredApps[filteredApps.length - 1];
          updateState({
            allApps: [...currentApps, ...filteredApps],
            lastCreatedAt: lastApp ? lastApp.created_at : null,
            appAddrs: [
              ...appListState.appAddrs,
              ...filteredApps.map((app) => cmn.generateAddr(app)),
            ],
          });
          if (activePage) {
            const apps = filteredApps?.slice(0, 6);
            console.log(apps, 'APPS FOR MAIN PAGE');
            dispatch(mainDataActions.setApps(apps));
          }
        } else {
          updateState({ hasMore: false });
          setEmpty(true);
        }
      } else {
        updateState({ hasMore: false });
      }
    } catch (error) {
      console.log(error, 'ERRROR');
    } finally {
      updateState({ loading: false });
    }
  };

  const handleScroll = () => {
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
  }, [categoryUrl, activeCategory]);

  const fetchAppsByCategory = (activeTab) => {
    clearApps();
    navigate(`/apps/category/${activeTab}`);
  };

  const setActiveCategoryInMainPage = (nav) => {
    dispatch(mainDataActions.setApps([]));
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
    <div className="pt-1">
      <Container className="ps-0 pe-0">
        <h2>Nostr apps</h2>
        {categoryUrl ? (
          <div className="d-flex justify-content-center pt-2 pb-1">
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
          <div className="d-flex justify-content-start pt-2 pb-3">
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
            {activePage ? (
              <>
                {appsForMain.length === 0 &&
                  !loading &&
                  'Nothing found on relays.'}
                <div className="container-apps">
                  {appsForMain.map((app) => {
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
                {loading && activePage && appsForMain.length === 0 && (
                  <LoadingSpinner />
                )}
              </>
            ) : null}
            {!activePage ? (
              <>
                {allApps.length === 0 && !loading && 'Nothing found on relays.'}
                <div className="container-apps">
                  {allApps.map((app) => {
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
                {loading && !empty && categoryUrl && hasMore && (
                  <LoadingSpinner />
                )}
              </>
            ) : null}
            {appsForMain.length > 0 && !categoryUrl ? (
              <Link to="/apps/category/all">
                <button
                  onClick={clearApps}
                  type="button"
                  class="btn btn-primary show-more-button"
                >
                  More Nostr apps &rarr;
                </button>
              </Link>
            ) : null}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NewApps;
