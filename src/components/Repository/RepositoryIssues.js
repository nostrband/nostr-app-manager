import React, { useState, useEffect } from 'react';
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import LoadingSpinner from '../../elements/LoadingSpinner';
import ArrowIcon from '../../icons/Arrow';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import BountyModal from './BountyModal';
import { useAuthShowModal } from '../../context/ShowModalContext';
import * as cmn from '../../common';
import { useAuth } from '../../context/AuthContext';

const RepositoryIssues = ({
  repoLink,
  naddr,
  linkToRepo,
  topTenContributorPubkeys,
}) => {
  const { pathname } = useLocation();
  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const issueUrl = searchParams.get('issue');
  const navigate = useNavigate();
  const { setShowLogin } = useAuthShowModal();
  const { pubkey } = useAuth();

  const getIssuesFromGithub = async (repoName, page = 1) => {
    const response = await fetch(
      `https://api.github.com/repos/${repoName}/issues?page=${page}&per_page=30`
    );
    const issuesAndPullRequests = await response.json();
    const issuesOnly = issuesAndPullRequests.filter(
      (issue) => !issue.pull_request
    );
    return issuesOnly;
  };

  useEffect(() => {
    const fetchAllIssues = async () => {
      setLoading(true);
      let githubLink;
      if (typeof repoLink !== 'string') {
        githubLink = repoLink.tags.find((tag) => tag[0] === 'r')[1];
      } else {
        githubLink = repoLink;
      }
      let repoName = githubLink.replace('https://github.com/', '');
      if (repoName.endsWith('/')) {
        repoName = repoName.slice(0, -1);
      }

      let allIssues = [];
      let page = 1;
      let issues;
      do {
        issues = await getIssuesFromGithub(repoName, page);
        allIssues = allIssues.concat(issues);
        page++;
      } while (issues.length > 0);
      setIssues(allIssues);
      setLoading(false);
    };

    fetchAllIssues().catch((error) => {
      console.error(error);
      setLoading(false);
    });
  }, [repoLink]);

  const showAuthModal = () => {
    if (!pubkey) {
      setShowLogin(true);
    }
  };

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
                  <div className="d-flex align-items-center">
                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm">Open on Github</Button>
                    </a>
                    <Link
                      onClick={showAuthModal}
                      to={
                        cmn.isAuthed()
                          ? `/r/${naddr}/bounty?issue=${issue.html_url}`
                          : ''
                      }
                      className="mt-1 mb-1 mx-2"
                    >
                      <Button size="sm">Add bounty</Button>
                    </Link>
                  </div>

                  {issue.body ? (
                    <p
                      className="description-issue"
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
                </>
              ) : null}
            </ListGroupItem>
          ))}
          <BountyModal
            issueUrl={issueUrl}
            handleClose={() => navigate(`/r/${naddr}`)}
            show={pathname === `/r/${naddr}/bounty`}
            naddr={naddr}
            topTenContributorPubkeys={topTenContributorPubkeys}
          />
        </ListGroup>
      )}
      {loading ? <LoadingSpinner /> : null}
      {!loading && issues?.length === 0 ? <span>Nothing yet.</span> : null}
    </>
  );
};

export default RepositoryIssues;
