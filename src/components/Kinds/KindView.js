import React, { useEffect, useState } from 'react';
import * as cmn from '../../common';
import { useParams } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';
import AppSelectItem from '../../elements/AppSelectItem';
import LoadingSpinner from '../../elements/LoadingSpinner';
import KindElement from '../../elements/KindElement';

const KindView = () => {
  const [loading, setLoading] = useState(false);
  const [appsByKind, setAppsByKind] = useState([]);
  const { kind } = useParams();

  useEffect(() => {
    const getAppsByTag = async () => {
      setLoading(true);
      const ndk = await cmn.getNDK();
      const filter = {
        kinds: [31990],
        '#k': [kind.toString()],
      };
      try {
        const response = await cmn.fetchAllEvents([
          cmn.startFetch(ndk, filter),
        ]);
        setAppsByKind(response);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    getAppsByTag();
  }, []);

  return (
    <>
      <h5 className="mt-2 mx-1">
        Apps by kind : <KindElement> {cmn.getKindLabel(kind)} </KindElement>
      </h5>
      <ListGroup>
        {loading ? (
          <LoadingSpinner />
        ) : (
          appsByKind.map((app) => {
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
        {appsByKind.length === 0 && !loading
          ? 'Sorry, nothing was found.'
          : null}
      </p>
    </>
  );
};

export default KindView;
