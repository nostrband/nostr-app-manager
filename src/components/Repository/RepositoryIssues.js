import React, { useState, useEffect } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import LoadingSpinner from '../../elements/LoadingSpinner';

const RepositoryIssues = ({ repoLink }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  const getIssuesFromGithub = async (repoLink) => {
    console.log(repoLink, 'REPO LINK');
    let repoName = repoLink?.replace('https://github.com/', '');
    if (repoName.endsWith('/')) {
      repoName = repoName.slice(0, -1);
    }
    const response = await fetch(
      `https://api.github.com/repos/${repoName}/issues`
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
    getIssuesFromGithub(githubLink)
      .then((data) => {
        console.log(data, 'DATAAA');
        if (Array.isArray(data)) {
          setIssues(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  }, [repoLink]);

  return (
    <>
      {issues.length > 0 && (
        <ListGroup>
          {issues.map((issue) => (
            <ListGroupItem className="d-flex flex-column" key={issue.id}>
              <strong>{issue.title}</strong>
              {issue.body ? (
                <p
                  className="description"
                  dangerouslySetInnerHTML={{
                    __html: issue.body?.replace(/\r\n/g, '<br>'),
                  }}
                ></p>
              ) : null}

              {issue.comments > 0 ? (
                <p style={{ margin: 0 }}>
                  Comments: <strong>{issue.comments}</strong>
                </p>
              ) : null}
              <a
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Github
              </a>
            </ListGroupItem>
          ))}
        </ListGroup>
      )}
      {loading ? <LoadingSpinner /> : null}
      {!loading && issues?.length === 0 ? <span>Nothing yet.</span> : null}
    </>
  );
};

export default RepositoryIssues;
