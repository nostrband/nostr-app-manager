import React, { useEffect, useState } from 'react';
import * as cmn from '../common';
import { ListGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router';

const PublisedRepositories = ({ pubkey }) => {
  const navigate = useNavigate();
  const [publishedRepositories, setPublishedRepositories] = useState([]);

  const fetchPublishedRepositories = async () => {
    const ndk = await cmn.getNDK();
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

  const navigateToRepositoryDetail = (event) => {
    const viewUrl = '/r/' + cmn.getNaddr(event);
    navigate(viewUrl);
  };

  return (
    <div>
      <h4 className="mt-5">Published repositories:</h4>
      <ListGroup>
        {publishedRepositories.length > 0 ? (
          publishedRepositories?.map((repo) => {
            const titleTag = repo.tags.find((tag) => tag[0] === 'title');
            const descriptionTag = repo.tags.find(
              (tag) => tag[0] === 'description'
            );
            return (
              <ListGroup.Item
                onClick={() => navigateToRepositoryDetail(repo)}
                key={repo.id}
                className="repo-item"
              >
                <div>
                  <strong>{titleTag && titleTag[1]}</strong>
                </div>
                <div>
                  <p> {descriptionTag && descriptionTag[1]}</p>
                </div>
              </ListGroup.Item>
            );
          })
        ) : (
          <span>Nothing yet.</span>
        )}
      </ListGroup>
    </div>
  );
};

export default PublisedRepositories;
