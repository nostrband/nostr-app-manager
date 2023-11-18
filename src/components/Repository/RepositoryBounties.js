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
import { useAuthShowModal } from '../../context/ShowModalContext';
import * as cmn from '../../common';
import { useAuth } from '../../context/AuthContext';
import { isPhone } from '../../const';
import Profile from '../../elements/Profile';

const RepositoryBounties = ({ repoLink, naddr, linkToRepo }) => {
  const { pathname } = useLocation();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
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

  const associateAuthorsWithBounty = (bounties, authors) => {
    return bounties.map((bounty) => {
      const author = authors.find((author) => author.pubkey === bounty.pubkey);
      return { ...bounty, author: author || null };
    });
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

      const bountyRequest = {
        kinds: [9042],
        '#a': [cmn.naddrToAddr(naddr)],
      };

      const ndk = await cmn.getNDK();
      const bounties = await cmn.fetchAllEvents([
        cmn.startFetch(ndk, bountyRequest),
      ]);

      const enrichedIssues = allIssues.map((issue) => {
        let issueBounties = [];
        bounties.forEach((bounty) => {
          const amountTag = bounty.tags.find((tag) => tag[0] === 'amount');
          const amount = amountTag ? amountTag[1] : null;
          const issueUrlTag = bounty.tags.find((tag) => tag[0] === 'r');
          if (issueUrlTag && issueUrlTag[1] === issue.html_url) {
            issueBounties.push({ ...bounty, amount: +amount });
          }
        });

        return {
          ...issue,
          bounties: issueBounties,
        };
      });
      const filteredIssues = enrichedIssues.filter(
        (issue) => issue.bounties && issue.bounties.length > 0
      );
      setIssues(filteredIssues);
      setLoading(false);
    };
    fetchAllIssues().catch((error) => {
      console.error(error);
      setLoading(false);
    });
  }, [repoLink]);

  console.log(issues, 'ISSUES');
  return (
    <>
      {issues.length > 0 && (
        <ListGroup>
          {issues.map((issue) => (
            <ListGroupItem className="d-flex flex-column" key={issue.id}>
              <div className="d-flex flex-column">
                <h6 style={{ margin: 0 }}>{issue.title}</h6>
                {issue.bounties.map((bounty) => {
                  return (
                    <div>
                      <span>
                        <div className="d-flex align-items-center">
                          <Profile
                            small
                            profile={{ profile: {} }}
                            pubkey={bounty.pubkey}
                          />
                          <div className="mx-3">
                            <span>Bounty:</span>
                            <strong className="mx-2">
                              {cmn.formatNumber(bounty.amount)}
                            </strong>
                          </div>
                        </div>
                        <p>{bounty.content}</p>
                      </span>
                    </div>
                  );
                })}
              </div>
            </ListGroupItem>
          ))}
        </ListGroup>
      )}
      {loading ? <LoadingSpinner /> : null}
      {!loading && issues?.length === 0 ? <span>Nothing yet.</span> : null}
    </>
  );
};

export default RepositoryBounties;
