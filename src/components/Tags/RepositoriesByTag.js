import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as cmn from '../../common';
import RepositoryElement from '../../elements/RepositoryElement';
import { ListGroup } from 'react-bootstrap';
import LoadingSpinner from '../../elements/LoadingSpinner';
import KindElement from '../../elements/KindElement';

const RepositoriesByTag = () => {
  const [loading, setLoading] = useState(false);
  const [repositoriesByTag, setRepositoriesByTag] = useState([]);
  const { tag } = useParams();

  useEffect(() => {
    const getRepositoriesByTag = async () => {
      setLoading(true);
      const ndk = await cmn.getNDK();
      const filter = {
        kinds: [30117],
        '#t': [tag],
      };
      try {
        const response = await cmn.fetchAllEvents([
          cmn.startFetch(ndk, filter),
        ]);
        setRepositoriesByTag(response);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    getRepositoriesByTag();
  }, [tag]);

  return (
    <>
      <h5>
        Repositories by tag :<KindElement>{tag}</KindElement>
      </h5>
      <ListGroup>
        {loading ? (
          <LoadingSpinner />
        ) : (
          repositoriesByTag.map((repo) => {
            return (
              <RepositoryElement
                key={repo.id}
                repo={repo}
                getUrl={cmn.getRepositoryUrl}
              />
            );
          })
        )}
      </ListGroup>
      <p className="d-flex justify-content-center">
        {repositoriesByTag.length === 0 && !loading
          ? 'Sorry, nothing was found.'
          : null}
      </p>
    </>
  );
};

export default RepositoriesByTag;
