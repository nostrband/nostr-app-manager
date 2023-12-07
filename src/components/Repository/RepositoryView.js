import React, { useEffect, useState } from 'react';
import { Button, Container, OverlayTrigger, Tooltip } from 'react-bootstrap';
import * as cmn from '../../common';
import LoadingSpinner from '../../elements/LoadingSpinner';
import ShareIconForRepository from '../../icons/ShareForRepository';
import KindElement from '../../elements/KindElement';
import Profile from '../../elements/Profile';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReasubleModal from '../../elements/Modal';
import { nip19 } from '@nostrband/nostr-tools';
import GitHubIconWithStar from '../../elements/GitHubIconWithStar';
import './PublishedRepositories.scss';
import ZapFunctional from '../MainPageComponents/ReviewsActions/ZapFunctional';
import Releases from '../Releases';
import RepositoryContributions from './RepositoryContributions';
import RepositoryIssues from './RepositoryIssues';
import { KIND_REMOVE_EVENT } from '../../const';
import RepositoryBounties from './RepositoryBounties';

const tabs = [
  {
    title: 'Contributors',
    path: 'contributors',
  },
  {
    title: 'Releases',
    path: 'releases',
  },

  {
    title: 'Issues',
    path: 'issues',
  },
  {
    title: 'Bounties',
    path: 'bounties',
  },
];

const dynamicTags = [
  {
    title: 'Programming languages:',
    key: 'programmingLanguages',
  },
  {
    title: 'Supported NIPs',
    key: 'nips',
  },
];

const RepositoryView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [repository, setRepository] = useState({
    tags: [],
  });
  const [authorRepository, setAuthorRepository] = useState();
  const { naddr, activeTab, issueUrl } = useParams();
  const editUrl = cmn.formatRepositoryEditUrl(naddr);
  const [pubkey, setPubKey] = useState('');
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [githubLink, setGithubLink] = useState([]);
  const [zapCount, setZapCount] = useState(0);

  const npub = cmn?.getLoginPubkey()
    ? nip19?.npubEncode(cmn?.getLoginPubkey())
    : '';

  const allowEditDelete =
    cmn.isAuthed() && cmn.getLoginPubkey() === repository?.pubkey;

  const fetchRepository = async () => {
    const ndk = await cmn.getNDK();

    const { resultFetchAllEvents, pubkey: pubkenFromServer } =
      await cmn.fetchRepositoryByUser(naddr);
    setPubKey(pubkenFromServer);
    const otherTags = resultFetchAllEvents[0]?.tags
      .filter((tag) => tag[0] === 't')
      .map((tag, index) => tag[1]);

    const programmingLanguages = resultFetchAllEvents[0]?.tags
      .filter((tag) => tag[0] === 'l' && tag[2] === 'programming-languages')
      .map((tag, index) => tag[1]);

    const nips = resultFetchAllEvents[0].tags
      .filter((tag) => tag[0] === 'l' && tag[2] === 'NIP')
      .map((tag, index) => tag[1]);
    const authorTag = resultFetchAllEvents[0]?.tags?.find(
      (tag) => tag[0] === 'p' && tag[3] === 'author'
    );
    let profile;
    if (authorTag) {
      profile = await cmn.getProfile(authorTag[1]);
    }

    const contributorTags = resultFetchAllEvents[0]?.tags?.filter(
      (tag) => tag[0] === 'p' && tag[2] === 'contributor'
    );

    const totalZapAmount = await cmn.fetchZapCounts(resultFetchAllEvents[0]);
    setZapCount(totalZapAmount / 1000);
    const filterForAuthorsOfEmptyContentApps = {
      kinds: [0],
      authors: contributorTags.map((contributor) => contributor[1]),
    };

    const authorProfileContributions = await cmn.fetchAllEvents([
      cmn.startFetch(ndk, filterForAuthorsOfEmptyContentApps),
    ]);

    const githubLink = resultFetchAllEvents[0]?.tags?.find(
      (tag) => tag[0] === 'r'
    );

    if (githubLink) {
      setGithubLink(githubLink[1]);
    }

    const contributorContributions = contributorTags.reduce((acc, tag) => {
      if (tag[0] === 'p' && tag[2] === 'contributor') {
        acc[tag[1]] = (acc[tag[1]] || 0) + parseInt(tag[3], 10);
      }
      return acc;
    }, {});

    const contributors = authorProfileContributions
      .map((profileContribution) => {
        return {
          ...profileContribution,
          contributions:
            contributorContributions[profileContribution.pubkey] || 0,
        };
      })
      .sort((a, b) => b.contributions - a.contributions);

    setContributors(contributors);

    const repositoryData = resultFetchAllEvents[0];
    setRepository({
      ...repositoryData,
      otherTags,
      programmingLanguages,
      nips,
      profile,
    });

    const filter = {
      kinds: [0],
      authors: [resultFetchAllEvents[0]?.pubkey],
    };
    const authorRepositoryByFilter = await cmn.fetchAllEvents([
      cmn.startFetch(ndk, filter),
    ]);
    if (authorRepositoryByFilter.length > 0) {
      const contentJson = JSON.parse(
        authorRepositoryByFilter[0].content || '{}'
      );
      const profile = {
        name: contentJson.display_name || contentJson.name || '',
        picture: contentJson.picture || '',
        about: contentJson.about || '',
        email: contentJson.nip05 || '',
        emailConfirmation: contentJson.lud16 || '',
        website: contentJson.website || '',
      };
      authorRepositoryByFilter[0].profile = profile;
      setAuthorRepository(authorRepositoryByFilter[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRepository();
  }, []);

  const deleteRepositoryHandler = async () => {
    const deleteEventRepository = {
      kind: KIND_REMOVE_EVENT,
      pubkey: repository?.pubkey,
      tags: [['e', repository?.id]],
      content: 'Deleting the repository',
    };

    try {
      setLoading(true);
      const result = await cmn.publishEvent(deleteEventRepository);
      if (result) {
        setOpenConfirmDeleteModal(false);
        navigate(`/p/${npub}`);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const getTagValue = (tagName) =>
    repository?.tags.find((tag) => tag[0] === tagName)?.[1] || '';

  const descriptionTagValue = getTagValue('description');
  const linkTagValue = getTagValue('r');
  const licenseTagValue = getTagValue('license');
  const processedDescription = descriptionTagValue
    .replace(/<br><br>/g, '\n')
    .replace(/<br>/g, '\n');

  let processedPubkeys;
  if (contributors.length > 0) {
    processedPubkeys = contributors
      .map((contributor) => contributor.pubkey)
      .slice(0, 10);
  }

  const appInfoViewComponents = {
    releases: <Releases repoLink={githubLink} />,
    ['contributors']: <RepositoryContributions contributors={contributors} />,
    issues: (
      <RepositoryIssues
        linkToRepo={linkTagValue}
        naddr={naddr}
        repoLink={githubLink}
        topTenContributorPubkeys={processedPubkeys}
      />
    ),
    bounties: (
      <RepositoryBounties
        linkToRepo={linkTagValue}
        naddr={naddr}
        repoLink={githubLink}
      />
    ),
  };

  if (!activeTab && !issueUrl) {
    navigate(`/r/${naddr}/contributors`, { replace: true });
  }

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Container className="mt-4 repository-view d-flex flex-column justify-content-between">
          <div className="d-flex">
            <ul>
              <Container className="container-name">
                <div>
                  <h2 className="font-weight-bold">
                    {`${
                      repository?.tags.find((tag) => tag[0] === 'title')?.[1] ||
                      ''
                    }`}
                  </h2>
                  <GitHubIconWithStar link={linkTagValue} />
                </div>
              </Container>

              {linkTagValue ? (
                <li>
                  <ShareIconForRepository />
                  <a
                    href={linkTagValue}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {linkTagValue}
                  </a>
                </li>
              ) : null}
              {processedDescription ? (
                <div className="description-repository">
                  {processedDescription.split('\n').map((str, index) => (
                    <p className="description" key={index}>
                      {str}
                    </p>
                  ))}
                </div>
              ) : null}

              {licenseTagValue ? (
                <li>
                  <strong>License: </strong>
                  {licenseTagValue}
                </li>
              ) : null}

              <li className="mt-3">
                <strong className="d-block">Tags </strong>
                {repository.otherTags.map((item) => {
                  return (
                    <button
                      class="btn btn-outline-primary mx-1 mb-2"
                      onClick={() => navigate(`/tag/${item}`)}
                      key={item}
                    >
                      {item}
                    </button>
                  );
                })}
              </li>

              {dynamicTags.map(({ title, key }) =>
                repository[key]?.length > 0 ? (
                  <li className="mt-3" key={title}>
                    <strong className="d-block">{title}</strong>
                    {repository[key].map((item) => {
                      return (
                        <KindElement
                          className="mx-1 mt-2"
                          key={item}
                          size="sm"
                          variant="outline-primary"
                        >
                          {item}
                        </KindElement>
                      );
                    })}
                  </li>
                ) : null
              )}

              <li className="mt-4">
                <div className="mt-2">
                  <strong>Published by:</strong>
                  <Profile
                    profile={authorRepository}
                    pubkey={pubkey}
                    small={true}
                  />
                </div>
                {repository.profile ? (
                  <div className="mt-2">
                    <strong>Author:</strong>
                    <Profile
                      profile={{ profile: repository.profile }}
                      pubkey={repository.profile.pubkey}
                      small={true}
                    />
                  </div>
                ) : null}
              </li>
            </ul>

            <div>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip className="tooltip-zap">Send zap</Tooltip>}
              >
                <button className="repository-info-zap-button">
                  <span className="font-weight-bold">
                    {cmn.formatNumber(zapCount)}
                  </span>
                  <ZapFunctional
                    noteId={nip19.noteEncode(repository.id)}
                    comment={linkTagValue ? `For ${linkTagValue}` : ''}
                  />
                </button>
              </OverlayTrigger>
              {allowEditDelete ? (
                <div>
                  <div className="mt-2 d-flex justify-content-center">
                    <Link className="w-100" to={editUrl}>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="w-100"
                      >
                        Edit
                      </Button>
                    </Link>
                  </div>
                  <Button
                    onClick={() => setOpenConfirmDeleteModal(true)}
                    size="sm"
                    className="btn-danger w-100 mt-2"
                  >
                    Delete
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="pt-4 pb-3">
            <ul className="nav nav-pills d-flex justify-content-center mb-2">
              {tabs.map((nav) => {
                return (
                  <Link to={`/r/${naddr}/${nav.path}`}>
                    <li
                      className={`pointer nav-link nav-item ${
                        activeTab === nav.path ? 'active' : ''
                      }`}
                    >
                      {nav.title}
                    </li>
                  </Link>
                );
              })}
            </ul>
            {appInfoViewComponents[activeTab]}
          </div>

          <ReasubleModal
            showModal={openConfirmDeleteModal}
            title="Are you sure you want to delete the repository?"
            handleCloseModal={() => setOpenConfirmDeleteModal(false)}
          >
            <div className="d-flex justify-content-center mt-3">
              <Button variant="secondary" className="w-50 ">
                Cancel
              </Button>
              <Button
                onClick={deleteRepositoryHandler}
                variant="primary"
                className="w-50 ms-3 btn-danger"
              >
                Delete
              </Button>
            </div>
          </ReasubleModal>
        </Container>
      )}
    </>
  );
};

export default RepositoryView;
