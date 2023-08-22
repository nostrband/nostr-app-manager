import React, { useEffect, useState } from 'react';
import { Col, Container, ListGroup, Row, Spinner } from 'react-bootstrap';
import * as cmn from '../../common';
import LoadingSpinner from '../../elements/LoadingSpinner';
import ApplicationItem from '../ApplicationItem';
import { useAuth } from '../../context/AuthContext';

const NewApps = () => {
  const { pubkey } = useAuth();
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastCreatedAt, setLastCreatedAt] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [followedPubkeys, setFollowedPubkeys] = useState([]);
  const [appAddrs, setAppAddrs] = useState([]);
  const [appCountsState, setAppCountsState] = useState({});

  function generateAddr(event) {
    const kind = event.kind;
    const pubkey = event.pubkey;
    const identifierTag = event.tags.find((tag) => tag[0] === 'd');
    if (!identifierTag) {
      console.error('Identifier tag not found for event:', event);
      return null;
    }
    const identifier = identifierTag[1];
    if (!kind || !pubkey || !identifier) {
      console.error('Invalid or missing data for event:', event);
      return null;
    }
    return `${kind}:${pubkey}:${identifier}`;
  }

  const fetchApps = async (created_at) => {
    setLoading(true);
    try {
      const info = await cmn.fetchAppsByKinds(null, created_at, 'MAIN_PAGE');
      const newAppsData = [];
      for (const name in info.apps) {
        const app = info.apps[name].handlers[0];
        newAppsData.push(app);
      }
      if (newAppsData.length > 0) {
        const filteredApps = newAppsData.filter(
          (newApp) =>
            !allApps.some((existingApp) => existingApp.id === newApp.id)
        );
        if (filteredApps.length === 0) {
          setEmpty(true);
        }
        setLastCreatedAt(filteredApps[filteredApps.length - 1].created_at);
        const currentAppAddrs = filteredApps.map((app) => generateAddr(app));
        setAppAddrs((prevAppAddrs) => [...prevAppAddrs, ...currentAppAddrs]);
        setAllApps((prevApps) => [...prevApps, ...filteredApps]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
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
    fetchApps();
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
          setFollowedPubkeys(pubkeys);
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
      if (appAddrs.length > 0) {
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
        const appUserMap = {};
        recommendedApps.forEach((recommendedApp) => {
          const appAddrTags = recommendedApp.tags.filter(
            (tag) => tag[0] === 'a'
          );
          const author = recommendedApp.author;

          appAddrTags.forEach((tag) => {
            const addr = tag[1];
            if (!appUserMap[addr]) {
              appUserMap[addr] = new Set();
            }
            appUserMap[addr].add(author);
          });
        });
        const appCounts = {};
        for (let addr in appUserMap) {
          appCounts[addr] = appUserMap[addr].size;
        }
        setAppCountsState(appCounts);
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
