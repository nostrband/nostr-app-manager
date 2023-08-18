import React, { useEffect, useState } from 'react';
import { Col, Container, ListGroup, Row, Spinner } from 'react-bootstrap';
import AppSelectItem from '../../elements/AppSelectItem';
import * as cmn from '../../common';
import LoadingSpinner from '../../elements/LoadingSpinner';
import ApplicationItem from '../ApplicationItem';

const NewApps = () => {
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastCreatedAt, setLastCreatedAt] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [empty, setEmpty] = useState(false);

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

  return (
    <div>
      <h2>New apps:</h2>
      <Container className="ps-0 pe-0">
        <Row>
          <Col>
            {allApps.length === 0 && !loading && 'Nothing found on relays.'}
            <div className="container-apps">
              {allApps?.map((app) => {
                return <ApplicationItem key={app.id} app={app} />;
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
