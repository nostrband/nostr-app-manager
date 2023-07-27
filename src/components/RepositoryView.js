import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router';
import * as cmn from '../common';
import LoadingSpinner from '../elements/LoadingSpinner';

const RepositoryView = () => {
  const [loading, setLoading] = useState(true);
  const [repository, setRepository] = useState({
    tags: [],
  });
  const [programmingLanguagesTags, setProgrammingLanguagesTags] = useState([]);
  const params = useParams();
  const addr = cmn.naddrToAddr(params.naddr.toLowerCase());

  const fetchRepository = async () => {
    const ndk = await cmn.getNDK();
    const parts = addr.split(':');
    const kind = parts[0];
    const pubkey = parts[1];
    const identifier = parts[2];
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
      .map((tag, index) => tag[1])
      .join(', ');
    setProgrammingLanguagesTags(programmingLanguagesAndTags);
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
          <h3>
            {`${repository?.tags.find((tag) => tag[0] === 'title')?.[1] || ''}`}
          </h3>
          {descriptionTagValue ? (
            <li>
              <strong>Description: </strong>
              {descriptionTagValue}
            </li>
          ) : null}
          {linkTagValue ? (
            <li>
              <strong>Link: </strong>
              {linkTagValue}
            </li>
          ) : null}

          {licenseTagValue ? (
            <li>
              <strong>License: </strong>
              {licenseTagValue}
            </li>
          ) : null}
          {programmingLanguagesTags.length > 0 ? (
            <li>
              <strong>Programming languages, tags: </strong>
              {`${programmingLanguagesTags}`}
            </li>
          ) : null}
        </ul>
      )}
    </Container>
  );
};

export default RepositoryView;
