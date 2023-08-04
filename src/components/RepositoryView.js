import React, { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useParams } from 'react-router';
import * as cmn from '../common';
import LoadingSpinner from '../elements/LoadingSpinner';
import ShareIconForRepository from '../icons/ShareForRepository';
import KindElement from '../elements/KindElement';
import Profile from '../elements/Profile';
import { Link, useNavigate } from 'react-router-dom';
import ReasubleModal from '../elements/Modal';
import { nip19 } from '@nostrband/nostr-tools';
import GitHubIconWithStar from '../elements/GitHubIconWithStar';

const RepositoryView = () => {
  const [loading, setLoading] = useState(true);
  const [repository, setRepository] = useState({
    tags: [],
  });
  const [authorRepository, setAuthorRepository] = useState();
  const { naddr } = useParams();
  const editUrl = cmn.formatRepositoryEditUrl(naddr);
  const [pubkey, setPubKey] = useState('');
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false);
  const npub = cmn?.getLoginPubkey()
    ? nip19?.npubEncode(cmn?.getLoginPubkey())
    : '';
  const navigate = useNavigate();
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
      .filter((tag) => tag[0] === 'l')
      .map((tag, index) => tag[1]);

    const repositoryData = resultFetchAllEvents[0];
    setRepository({ ...repositoryData, otherTags, programmingLanguages });

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
        name: contentJson.name || '',
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
      kind: 5,
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

  const descriptionTagValue =
    repository?.tags.find((tag) => tag[0] === 'description')?.[1] || '';
  const linkTagValue =
    repository?.tags.find((tag) => tag[0] === 'r')?.[1] || '';
  const licenseTagValue =
    repository?.tags.find((tag) => tag[0] === 'license')?.[1] || '';

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Container className="mt-4 repository-view d-flex justify-content-between">
          <ul>
            <div className="container-name">
              <h2 className="font-weight-bold">
                {`${
                  repository?.tags.find((tag) => tag[0] === 'title')?.[1] || ''
                }`}
              </h2>
              <GitHubIconWithStar link={linkTagValue} />
            </div>

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
            {descriptionTagValue ? (
              <p
                className="description-repository"
                dangerouslySetInnerHTML={{ __html: descriptionTagValue }}
              ></p>
            ) : null}
            {licenseTagValue ? (
              <li>
                <strong>License: </strong>
                {licenseTagValue}
              </li>
            ) : null}
            {repository?.programmingLanguages?.length > 0 ? (
              <li className="mt-3">
                <strong className="d-block">Programming languages:</strong>
                {repository?.programmingLanguages?.map((item) => {
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
            ) : null}
            {repository?.otherTags?.length > 0 ? (
              <li className="mt-3">
                <strong className="d-block">Tags:</strong>
                {repository?.otherTags?.map((item) => {
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
            ) : null}
            <li className="mt-4">
              <strong>Published by:</strong>
              <div className="mt-2">
                <Profile
                  profile={authorRepository}
                  pubkey={pubkey}
                  small={true}
                />
              </div>
            </li>
          </ul>

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
