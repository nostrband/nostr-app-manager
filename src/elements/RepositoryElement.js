import React, { useEffect, useRef } from 'react';
import { ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import GitHubIconWithStar from './GitHubIconWithStar';
import ZapFunctional from '../components/MainPageComponents/ReviewsActions/ZapFunctional';
import { nip19 } from '@nostrband/nostr-tools';
import KindElement from './KindElement';

const RepositoryElement = ({ repo, getUrl, countContributors }) => {
  const navigate = useNavigate();
  const titleTag = repo.tags.find((tag) => tag[0] === 'title');
  const descriptionTag = repo.tags.find((tag) => tag[0] === 'description');
  const tagsContainerRef = useRef(null);

  const programmingLanguages = repo.tags
    .filter((item) => item[0] === 'l')
    .map((item) => item[1]);

  const license = repo.tags.find((tag) => tag[0] === 'license');
  const tags = repo.tags
    .filter((item) => item[0] === 't')
    .map((item) => item[1]);

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

  useEffect(() => {
    const handleWheel = (event) => {
      if (tagsContainerRef.current) {
        event.preventDefault();
        const { deltaX, deltaY } = event;
        tagsContainerRef.current.scrollLeft += deltaY + deltaX;
      }
    };
    const tagsContainerEl = tagsContainerRef.current;
    tagsContainerEl.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (tagsContainerEl) {
        tagsContainerEl.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <ListGroup.Item className="repository-card">
      <div className="repository-link-actions-container">
        <Link className="card-link" to={getUrl(repo)}>
          <div>
            <strong>{titleTag && titleTag[1]}</strong>
          </div>
          <div>
            <p className="mb-2">{limitedDescription}</p>

            {countContributors > 0 ? (
              <span>
                <strong>{countContributors}</strong> contributors
              </span>
            ) : null}
          </div>
        </Link>
        <div className="actions">
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
        </div>
      </div>

      <div>
        <div className="d-flex align-items-center">
          <div ref={tagsContainerRef} className="tags-container">
            {license ? (
              <div className="license">
                <KindElement>{license[1]?.toUpperCase()}</KindElement>
              </div>
            ) : null}

            {programmingLanguages?.length > 0 ? (
              <div className="programming-languages-container">
                {programmingLanguages?.map((language) => {
                  return <KindElement key={language}>{language}</KindElement>;
                })}
              </div>
            ) : null}
            {tags?.length > 0 ? (
              <div className="tags">
                {tags?.map((tag) => {
                  return (
                    <button
                      className="tag-button-repository-element btn btn-outline-primary"
                      onClick={() => navigate(`/tag/${tag}`)}
                      key={tag}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ListGroup.Item>
  );
};

export default RepositoryElement;
