import React, { useState, useEffect } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import ArrowIcon from '../../icons/Arrow';
import './ReleasesAppInfoView.scss';
import LoadingSpinner from '../../elements/LoadingSpinner';

const ReleasesAppInfoView = ({ repoLink }) => {
  const [releases, setReleases] = useState([]);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [loading, setLoading] = useState(false);

  const getReleasesFromGithub = async (repoLink) => {
    const repoName = repoLink?.replace('https://github.com/', '');
    const response = await fetch(
      `https://api.github.com/repos/${repoName}/releases`
    );
    return await response.json();
  };

  useEffect(() => {
    setLoading(true);
    let githubLink;
    if (typeof repoLink !== 'string') {
      githubLink = repoLink.tags.find((tag) => tag[0] === 'r')[1];
    } else {
      githubLink = repoLink;
    }

    getReleasesFromGithub(githubLink)
      .then((data) => {
        setReleases(data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  }, [repoLink]);
  return (
    <div>
      <ListGroup>
        {releases?.map((release) => (
          <ListGroupItem className="releases-item" key={release.id}>
            <div
              onClick={() =>
                setSelectedRelease(
                  release.id === selectedRelease ? null : release.id
                )
              }
              className="d-flex releases-item-title"
            >
              <h5>{release.name || release.tag_name}</h5>
              <ArrowIcon
                className={`arrow ${
                  release.id === selectedRelease ? 'reverse' : ''
                }`}
              />
            </div>

            {selectedRelease === release.id && (
              <div>
                <p>{release.body}</p>
                <a
                  href={release.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Github
                </a>
              </div>
            )}
          </ListGroupItem>
        ))}
      </ListGroup>
      {loading ? <LoadingSpinner /> : null}
      {!loading && releases.length === 0 ? <span>Nothing yet.</span> : null}
    </div>
  );
};

export default ReleasesAppInfoView;
