import React, { useEffect, useState } from 'react';
import * as cmn from '../common';
import { ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import ShareIconForRepository from '../icons/ShareForRepository';

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
            const link = repo.tags.find((tag) => tag[0] === 'r');
            console.log(link, 'LINK');
            let limitedDescription = '';
            if (descriptionTag) {
              const cleanDescription = descriptionTag[1].replace(
                /<br\s*\/?>/gi,
                ' '
              );
              const trimmedDescription = cleanDescription
                .replace(/<[^>]+>/g, '')
                .trim();
              const singleSpaceDescription = trimmedDescription.replace(
                /\s+/g,
                ' '
              );
              limitedDescription =
                singleSpaceDescription.length > 170
                  ? singleSpaceDescription.substring(0, 170) + '...'
                  : singleSpaceDescription;
            }
            return (
              <ListGroup.Item
                onClick={() => navigateToRepositoryDetail(repo)}
                key={repo.id}
                className="repo-item"
              >
                <div>
                  <strong>{titleTag && titleTag[1]}</strong>
                </div>
                {link ? (
                  <div className="mt-1 mb-1 limited-text">
                    <ShareIconForRepository />
                    <a href={link[1]} target="_blank" rel="noopener noreferrer">
                      {link[1]}
                    </a>
                  </div>
                ) : null}

                <div>
                  <p className="limited-text">{limitedDescription}</p>
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
