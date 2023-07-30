import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router';
import * as cmn from '../common';
import LoadingSpinner from '../elements/LoadingSpinner';
import ShareIconForRepository from '../icons/ShareForRepository';
import KindElement from '../elements/KindElement';
import Profile from '../elements/Profile';

const RepositoryView = () => {
  const [loading, setLoading] = useState(true);
  const [repository, setRepository] = useState({
    tags: [],
  });
  const [programmingLanguagesTags, setProgrammingLanguagesTags] = useState([]);
  const [authorRepository, setAuthorRepository] = useState();

  const params = useParams();
  const addr = cmn.naddrToAddr(params.naddr.toLowerCase());
  const parts = addr.split(':');
  const kind = parts[0];
  const pubkey = parts[1];
  const identifier = parts[2];

  const fetchRepository = async () => {
    const ndk = await cmn.getNDK();

    const addrForFilter = {
      kinds: [+kind],
      authors: [pubkey],
      '#d': [identifier],
    };
    const resultFetchAllEvents = await cmn.fetchAllEvents([
      cmn.startFetch(ndk, addrForFilter),
    ]);
    setRepository(resultFetchAllEvents[0]);

    const programmingLanguagesAndTags = resultFetchAllEvents[0]?.tags
      .filter((tag) => tag[0] === 't')
      .map((tag, index) => tag[1]);

    setProgrammingLanguagesTags(programmingLanguagesAndTags);

    const filter = {
      kinds: [0],
      authors: [resultFetchAllEvents[0].pubkey],
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

  const descriptionTagValue =
    repository?.tags.find((tag) => tag[0] === 'description')?.[1] || '';
  const linkTagValue =
    repository?.tags.find((tag) => tag[0] === 'r')?.[1] || '';
  const licenseTagValue =
    repository?.tags.find((tag) => tag[0] === 'license')?.[1] || '';

  return (
    <Container className="mt-4 repository-view">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ul>
          <h2 className="font-weight-bold">
            {`${repository?.tags.find((tag) => tag[0] === 'title')?.[1] || ''}`}
          </h2>
          {linkTagValue ? (
            <li>
              <ShareIconForRepository />
              <a href={linkTagValue} target="_blank" rel="noopener noreferrer">
                {linkTagValue}
              </a>
            </li>
          ) : null}
          {descriptionTagValue ? <p>{descriptionTagValue}</p> : null}
          {licenseTagValue ? (
            <li>
              <strong>License: </strong>
              {licenseTagValue}
            </li>
          ) : null}
          {programmingLanguagesTags.length > 0 ? (
            <li className="mt-3">
              <strong className="d-block">
                Programming languages and tags:
              </strong>
              {programmingLanguagesTags.map((item) => {
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

          <li className="mt-2">
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
      )}
    </Container>
  );
};

export default RepositoryView;
