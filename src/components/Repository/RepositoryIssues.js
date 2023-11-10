import React, { useState, useEffect } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import LoadingSpinner from '../../elements/LoadingSpinner';
import ArrowIcon from '../../icons/Arrow';

const RepositoryIssues = ({ repoLink }) => {
  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [loading, setLoading] = useState(false);

  const getIssuesFromGithub = async (repoLink) => {
    let repoName = repoLink?.replace('https://github.com/', '');
    if (repoName.endsWith('/')) {
      repoName = repoName.slice(0, -1);
    }
    const response = await fetch(
      `https://api.github.com/repos/${repoName}/issues`
    );
    const issuesAndPullRequests = await response.json();

    const issuesOnly = issuesAndPullRequests.filter(
      (issue) => !issue.pull_request
    );
    return issuesOnly;
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
        if (Array.isArray(data)) {
          console.log(data, 'DATAAA');
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
              <div
                onClick={() =>
                  setSelectedIssueId(
                    issue.id === selectedIssueId ? null : issue.id
                  )
                }
                className="d-flex align-items-center justify-content-between releases-item-title"
              >
                <h6 style={{ margin: 0 }}>{issue.title}</h6>
                <div>
                  <ArrowIcon
                    className={`arrow ${
                      issue.id === selectedIssueId ? 'reverse' : ''
                    }`}
                  />
                </div>
              </div>
              {issue.id === selectedIssueId ? (
                <>
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
                </>
              ) : null}
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
