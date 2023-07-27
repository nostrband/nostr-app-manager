import React, { useEffect, useState } from 'react';
import * as cmn from '../common';
import { ListGroup } from 'react-bootstrap';

const PublisedRepositories = () => {
  const [publishedRepositories, setPublishedRepositories] = useState([]);

  const fetchPublishedRepositories = async () => {
    const ndk = await cmn.getNDK();
    const pubkey = cmn.getLoginPubkey() ? cmn.getLoginPubkey() : '';

    const addrForFilter = {
      kinds: [30117],
      authors: [pubkey],
    };
    const resultFetchAllEvents = await cmn.fetchAllEvents([
      cmn.startFetch(ndk, addrForFilter),
    ]);
    setPublishedRepositories(resultFetchAllEvents);
  };

  useEffect(() => {
    fetchPublishedRepositories();
  }, []);

  console.log(publishedRepositories, 'PUBLISHED REPOS');
  return (
    <div>
      <h4 className="mt-5">Publised repositories:</h4>
      <ListGroup>
        {publishedRepositories?.map((repo) => {
          return <div>test</div>;
        })}
      </ListGroup>
    </div>
  );
};

export default PublisedRepositories;
