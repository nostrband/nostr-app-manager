import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import GitHubIconWithStar from './GitHubIconWithStar';
import ZapFunctional from '../components/MainPageComponents/ReviewsActions/ZapFunctional';
import { nip19 } from '@nostrband/nostr-tools';

const RepositoryElement = ({ repo, getUrl, countContributions }) => {
  const titleTag = repo.tags.find((tag) => tag[0] === 'title');
  const descriptionTag = repo.tags.find((tag) => tag[0] === 'description');

  const link = repo.tags.find((tag) => tag[0] === 'r');
  const url = link && link.length > 1 ? link[1] : '';
  let limitedDescription = '';
  if (descriptionTag) {
    const cleanDescription = descriptionTag[1].replace(/<br\s*\/?>/gi, ' ');
    const trimmedDescription = cleanDescription.replace(/<[^>]+>/g, '').trim();
    const singleSpaceDescription = trimmedDescription.replace(/\s+/g, ' ');
    limitedDescription =
      singleSpaceDescription.length > 170
        ? singleSpaceDescription.substring(0, 170) + '...'
        : singleSpaceDescription;
  }

  return (
    <ListGroup.Item className="repository-card">
      <Link className="card-link" to={getUrl(repo)}>
        <div>
          <strong>{titleTag && titleTag[1]}</strong>
        </div>
        <div>
          <p className="mb-2">{limitedDescription}</p>
          {countContributions > 0 ? (
            <span>
              <strong>{countContributions}</strong> contributors
            </span>
          ) : null}
        </div>
      </Link>
      {link ? (
        <a
          className="link-to-github"
          href={link[1]}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIconWithStar link={url} />
        </a>
      ) : null}
      <div className="zap-button-repository">
        <ZapFunctional
          noteId={nip19.noteEncode(repo.id)}
          comment={url ? `For ${url}` : ''}
        />
      </div>
    </ListGroup.Item>
  );
};

export default RepositoryElement;
