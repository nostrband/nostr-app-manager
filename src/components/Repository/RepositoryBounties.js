import React, { useState, useEffect } from 'react';
import { Button, ListGroup, ListGroupItem, Modal } from 'react-bootstrap';
import LoadingSpinner from '../../elements/LoadingSpinner';
import ArrowIcon from '../../icons/Arrow';
import * as cmn from '../../common';
import { useAuth } from '../../context/AuthContext';
import { KIND_REMOVE_EVENT, isPhone } from '../../const';
import Profile from '../../elements/Profile';
import DeleteIcon from '../../icons/DeleteIcon';

const RepositoryBounties = ({ repoLink, naddr, linkToRepo }) => {
  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { pubkey } = useAuth();
  const [bountyIdForRemove, setBountyIdForRemove] = useState();

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

      const bountyRequest = {
        kinds: [9042],
        '#a': [cmn.naddrToAddr(naddr)],
      };

      const ndk = await cmn.getNDK();
      const bounties = await cmn.fetchAllEvents([
        cmn.startFetch(ndk, bountyRequest),
      ]);

      let authorsBounties = [];
      if (bounties) {
        const authorsForBountiesRequest = {
          kinds: [0],
          authors: bounties.map((bounty) => bounty.pubkey),
        };

        authorsBounties = await cmn.fetchAllEvents([
          cmn.startFetch(ndk, authorsForBountiesRequest),
        ]);
      }

      const enrichedIssues = allIssues.map((issue) => {
        let issueBounties = [];
        let bountySum = 0;
        bounties.forEach((bounty) => {
          const amountTag = bounty.tags.find((tag) => tag[0] === 'amount');
          const amount = amountTag ? amountTag[1] : null;
          const issueUrlTag = bounty.tags.find((tag) => tag[0] === 'r');
          if (issueUrlTag && issueUrlTag[1] === issue.html_url) {
            issueBounties.push({ ...bounty, amount: parseInt(amount) / 1000 });
            bountySum += parseInt(amountTag[1], 10);
          }
        });
        return {
          ...issue,
          bounty_total_amount: bountySum / 1000,
          bounties: cmn.associateEventsWithReviews(
            issueBounties,
            authorsBounties
          ),
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

  const removeBountyRequest = async (issueId, bountyId) => {
    const eventForRemove = {
      kind: KIND_REMOVE_EVENT,
      tags: [['e', bountyId]],
      content: 'Deleting the bounty',
    };
    const result = await cmn.publishEvent(eventForRemove);
    if (result) {
      setIssues((prevIssues) => {
        return prevIssues.reduce((acc, issue) => {
          if (issue.id === issueId) {
            const updatedBounties = issue.bounties.filter(
              (bounty) => bounty.id !== bountyId
            );
            if (updatedBounties.length > 0) {
              acc.push({ ...issue, bounties: updatedBounties });
            }
          } else {
            acc.push(issue);
          }
          return acc;
        }, []);
      });
    }
  };

  return (
    <>
      {issues.length > 0 && (
        <ListGroup>
          {issues.map((issue) => {
            return (
              <ListGroupItem className="d-flex flex-column" key={issue.id}>
                <div className="d-flex flex-column">
                  <div
                    onClick={() =>
                      setSelectedIssueId(
                        issue.id === selectedIssueId ? null : issue.id
                      )
                    }
                    className="d-flex justify-content-between pointer align-items-center"
                  >
                    <h6 style={{ margin: 0 }}>{issue.title}</h6>
                    <div className="d-flex align-items-center">
                      {issue.bounty_total_amount > 0 && !isPhone ? (
                        <span className="mx-2 d-flex">
                          Bounty:
                          <strong className="mx-1">
                            {cmn.formatNumber(issue.bounty_total_amount)}
                          </strong>
                          sats
                        </span>
                      ) : null}
                      <ArrowIcon
                        className={`arrow ${
                          issue.id === selectedIssueId ? 'reverse' : ''
                        }`}
                      />
                    </div>
                  </div>
                  {issue.id === selectedIssueId ? (
                    <>
                      <a
                        className="mx-2 pb-3"
                        href={issue.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm">Open on Github</Button>
                      </a>
                      {issue.bounties.map((bounty) => {
                        let authorProfile = bounty.author?.content
                          ? cmn.convertContentToProfile([bounty.author])
                          : {};
                        return (
                          <>
                            <div className="bounty-item mx-2">
                              <div>
                                <div className="d-flex align-items-center">
                                  <Profile
                                    small
                                    profile={{ profile: authorProfile }}
                                    pubkey={bounty.pubkey}
                                  />
                                  <span className="mx-3">
                                    Bounty:
                                    <strong className="mx-1">
                                      {cmn.formatNumber(bounty.amount)}
                                    </strong>
                                  </span>
                                </div>
                                <p>{bounty.content}</p>
                              </div>
                              {bounty.pubkey === pubkey ? (
                                <DeleteIcon
                                  onClick={() =>
                                    setBountyIdForRemove(bounty.id)
                                  }
                                />
                              ) : null}
                            </div>
                            <Modal
                              show={bounty.id === bountyIdForRemove}
                              onHide={() => setBountyIdForRemove('')}
                            >
                              <Modal.Header closeButton>
                                <Modal.Title>
                                  Do you want to delete bounty?
                                </Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                <div className="d-flex justify-content-center ">
                                  <Button
                                    onClick={() => {
                                      setBountyIdForRemove('');
                                    }}
                                    variant="secondary"
                                    className="w-50 "
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      removeBountyRequest(issue.id, bounty.id)
                                    }
                                    variant="primary"
                                    className="w-50 ms-3 btn-danger"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </Modal.Body>
                            </Modal>
                          </>
                        );
                      })}
                    </>
                  ) : null}
                </div>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      )}
      {loading ? <LoadingSpinner /> : null}
      {!loading && issues?.length === 0 ? <span>Nothing yet.</span> : null}
    </>
  );
};

export default RepositoryBounties;
