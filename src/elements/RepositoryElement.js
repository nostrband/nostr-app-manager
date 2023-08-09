import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import GitHubIconWithStar from './GitHubIconWithStar';

const RepositoryElement = ({ repo, getUrl }) => {
  const titleTag = repo.tags.find((tag) => tag[0] === 'title');

  const descriptionTag = repo.tags.find((tag) => tag[0] === 'description');

  const link = repo.tags.find((tag) => tag[0] === 'r');
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
    <ListGroup.Item className="repository-card ">
      <Link className="card-link" to={getUrl(repo)}>
        <div>
          <strong>{titleTag && titleTag[1]}</strong>
        </div>
        <div>
          <p>{limitedDescription}</p>
        </div>
      </Link>
      {link ? (
        <a
          className="link-to-github "
          href={link[1]}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIconWithStar link={link[1]} />
        </a>
      ) : null}
    </ListGroup.Item>
  );
};

export default RepositoryElement;
