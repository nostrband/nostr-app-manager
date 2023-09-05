import React, { useEffect, useState } from 'react';
import * as cmn from '../../common';
import { useParams } from 'react-router-dom';
import * as cs from '../../const';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import AppSelectItem from '../../elements/AppSelectItem';
import LoadingSpinner from '../../elements/LoadingSpinner';
import KindElement from '../../elements/KindElement';

const AppsByTag = () => {
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState([]);

  const { tag } = useParams();

  useEffect(() => {
    const getAppsByTag = async () => {
      setLoading(true);
      const ndk = await cmn.getNDK();
      const filter = {
        kinds: [cs.KIND_HANDLERS],
        '#t': [tag],
      };
      try {
        const response = await cmn.fetchAllEvents([
          cmn.startFetch(ndk, filter),
        ]);
        setApps(response);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    getAppsByTag();
  }, []);

  return (
    <>
      <h5>
        Apps by tag :<KindElement>{tag}</KindElement>
      </h5>
      <ListGroup>
        {loading ? (
          <LoadingSpinner />
        ) : (
          apps.map((app) => {
            const content = cmn.convertContentToProfile([app]);
            return (
              <AppSelectItem
                key={app.id}
                app={{ ...app, profile: content }}
                pubkey={content.pubkey}
              />
            );
          })
        )}
      </ListGroup>
      <p className="d-flex justify-content-center">
        {apps.length === 0 && !loading ? 'Sorry, nothing was found.' : null}
      </p>
    </>
  );
};

export default AppsByTag;
