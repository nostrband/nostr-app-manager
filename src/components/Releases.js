import React, { useState, useEffect } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import ArrowIcon from '../icons/Arrow';
import './Releases.scss';
import LoadingSpinner from '../elements/LoadingSpinner';

const parseRepoLink = (link) => {
  let repoName = link?.replace('https://github.com/', '');
  return repoName.endsWith('/') ? repoName.slice(0, -1) : repoName;
};

const Releases = ({ repoLink }) => {
  const [releases, setReleases] = useState([]);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [loading, setLoading] = useState(false);

  const getReleasesFromGithub = async (repoName) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoName}/releases`
      );
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching releases:', error);
      return [];
    }
  };

  useEffect(() => {
    setLoading(true);
    let githubLink =
      typeof repoLink === 'string'
        ? repoLink
        : repoLink.tags.find((tag) => tag[0] === 'r')[1];
    const repoName = parseRepoLink(githubLink);

    getReleasesFromGithub(repoName)
      .then((data) => {
        setReleases(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [repoLink]);

  return (
    <div>
      <ListGroup>
        {releases.map((release) => (
          <ListGroupItem className="releases-item" key={release.id}>
            <div
              onClick={() =>
                setSelectedRelease(
                  release.id === selectedRelease ? null : release.id
                )
              }
              className="d-flex releases-item-title"
            >
              <h6>{release.name || release.tag_name}</h6>
              <ArrowIcon
                className={`arrow ${
                  release.id === selectedRelease ? 'reverse' : ''
                }`}
              />
            </div>

            {selectedRelease === release.id && (
              <div>
                {release.body ? (
                  <p
                    dangerouslySetInnerHTML={{
                      __html: release.body?.replace(/\r\n/g, '<br>'),
                    }}
                  ></p>
                ) : null}
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

export default Releases;
