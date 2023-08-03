import React, { useEffect, useState } from 'react';
import * as cmn from '../common';
import { ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './PublishedRepositories.scss';
import GithubIcon from '../icons/Github';

const PublishedRepositories = ({ pubkey }) => {
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

  const getUrl = (event) => {
    const viewUrl = '/r/' + cmn.getNaddr(event);
    return viewUrl;
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
              <ListGroup.Item className="repository-card repo-item">
                <Link className="card-link" to={getUrl(repo)}>
                  <div>
                    <strong>{titleTag && titleTag[1]}</strong>
                  </div>
                  <div>
                    <p className="limited-text">{limitedDescription}</p>
                  </div>
                </Link>
                {link ? (
                  <a
                    className="link-to-github "
                    href={link[1]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon />
                  </a>
                ) : null}
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

export default PublishedRepositories;
