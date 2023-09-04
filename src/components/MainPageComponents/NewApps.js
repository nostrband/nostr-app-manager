import React, { useEffect, useState } from 'react';
import { Col, Container, ListGroup, Row, Spinner } from 'react-bootstrap';
import * as cmn from '../../common';
import LoadingSpinner from '../../elements/LoadingSpinner';
import ApplicationItem from '../ApplicationItem';
import { useAuth } from '../../context/AuthContext';
import { generateAddr } from '../../common';
import { useAppState } from '../../context/AppContext';

const NewApps = () => {
  const { pubkey } = useAuth();
  const { appListState, setAppListState, empty, setEmpty } = useAppState();
  const {
    allApps,
    loading,
    appAddrs,
    appCountsState,
    hasMore,
    lastCreatedAt,
    followedPubkeys,
  } = appListState;

  console.log({ allApps, empty, hasMore, lastCreatedAt }, 'ALL DATA');

  const updateState = (changes) => {
    setAppListState((prevState) => ({ ...prevState, ...changes }));
  };

  const fetchApps = async (created_at) => {
    updateState({ loading: true });
    try {
      const info = await cmn.fetchAppsByKinds(null, created_at, 'MAIN_PAGE');
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
        console.log(filteredApps, 'FILTERED APPS');
        if (filteredApps.length === 0) {
          setEmpty(true);
        }
        updateState({
          allApps: [...currentApps, ...filteredApps],
          lastCreatedAt: filteredApps[filteredApps.length - 1].created_at,
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
    if (!loading && hasMore && lastCreatedAt) {
      const scrollBottom = Math.abs(
        document.documentElement.scrollHeight -
          (window.innerHeight + document.documentElement.scrollTop)
      );
      if (scrollBottom < 10 && !empty) {
        fetchApps(lastCreatedAt);
      }
    }
  };

  useEffect(() => {
    if (allApps.length > 0) {
      fetchApps(lastCreatedAt);
    } else {
      fetchApps();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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
        <h2>New apps:</h2>
        <Row>
          <Col>
            {allApps.length === 0 && !loading && 'Nothing found on relays.'}
            <div className="container-apps">
              {allApps?.map((app) => {
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
            {loading && !empty && <LoadingSpinner />}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NewApps;
