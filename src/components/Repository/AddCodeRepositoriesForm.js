import React, { useRef, useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Formik, Field } from 'formik';
import {
  KIND_REPOSITORY,
  optionsLicensies,
  programmingLanguages,
  validationSchemaForFormAddApp,
} from '../../const';
import * as cmn from '../../common';
import CreatableSelect from 'react-select/creatable';
import { useNavigate, useParams } from 'react-router-dom';
import TextAreaAutosize from 'react-textarea-autosize';
import { optionsNips } from '../../const';
import { nip19 } from '@nostrband/nostr-tools';

const CodeRepositoryForm = () => {
  const { naddr } = useParams();
  const [tempTag, setTempTag] = useState('');
  const [tempLanguage, setTempLanguage] = useState('');
  const [tempNipValue, setTempNipValue] = useState('');
  const [initialValues, setInitialValues] = useState({
    name: '',
    description: '',
    link: '',
    tags: [],
    license: '',
    programmingLanguages: [],
    nips: [],
    author: '',
  });
  const pubkey = cmn.getLoginPubkey() ? cmn.getLoginPubkey() : '';
  const [identifier, setIdentifier] = useState('');
  const appsUrl = cmn.formatProfileUrl(cmn.formatNpub(pubkey));
  const navigate = useNavigate();

  const handleSubmitHandler = async (values) => {
    const d = identifier ? identifier : '' + Date.now().toString();
    const published_at = initialValues.published_at
      ? initialValues.published_at
      : Math.floor(Date.now() / 1000).toString();

    const description = values.description;
    const npub = values.author;

    const { type, data } = npub ? nip19.decode(npub) : { type: null };

    const event = {
      kind: KIND_REPOSITORY,
      tags: [
        ['title', values.name],
        ['description', description],
        ['r', values.link],
        ['license', values?.license?.value],
        ['d', d],
        ...values.tags.map((tag) => ['t', tag.label]),
        ...values.programmingLanguages.map((lang) => [
          'l',
          lang.label,
          'programming-languages',
        ]),
        ...values.nips.map((nip) => ['l', nip.value, 'NIP']),
        ['L', 'NIP'],
        ['L', 'programming-languages'],
        ['published_at', published_at],
        ['alt', `Code repository: ${values.name}`],
      ],
      content: '',
    };

    if (type === 'npub') {
      const AUTHOR_PUBKEY = data;
      const PUBLISHER_PUBKEY = pubkey;

      event.tags.push(
        ['zap', AUTHOR_PUBKEY, 'wss://relay.nostr.band', '9'],
        ['zap', PUBLISHER_PUBKEY, 'wss://relay.nostr.band', '1'],
        ['p', AUTHOR_PUBKEY, 'wss://relay.nostr.band', 'author']
      );
    }
    event.tags = event.tags.filter((tag) => tag[1]);
    const naddr = cmn.formatNaddr({
      kind: KIND_REPOSITORY,
      pubkey: cmn.getLoginPubkey(),
      identifier: d,
    });
    setTimeout(() => {
      navigate(cmn.formatRepositoryUrl(naddr));
    }, 500);
  };
  const getRepositoryForEdit = async () => {
    const { resultFetchAllEvents, identifier: identifierForEdit } =
      await cmn.fetchRepositoryByUser(naddr);
    const repositoryData = resultFetchAllEvents[0];
    setIdentifier(identifierForEdit);
    if (repositoryData) {
      const findTagValue = (tag) => {
        const foundTag = repositoryData.tags.find((t) => t[0] === tag);
        return foundTag ? foundTag[1] : '';
      };
      const descriptionWithLineBreaks = findTagValue('description').replace(
        /<br>/g,
        '\n'
      );
      const authorTag = repositoryData?.tags?.find(
        (tag) => tag[0] === 'p' && tag[3] === 'author'
      );
      let author;
      if (authorTag) {
        author = nip19.npubEncode(authorTag[1]);
      }
      const initialValuesInFunction = {
        name: repositoryData.tags.find((tag) => tag[0] === 'title')[1] || '',
        description: descriptionWithLineBreaks,
        author,
        link: findTagValue('r'),
        published_at: findTagValue('published_at'),
        license: optionsLicensies.find(
          (option) => option.value === findTagValue('license')
        ),
        tags: repositoryData.tags
          .filter((tag) => tag[0] === 't')
          .map((tag) => ({ label: tag[1], value: tag[1] })),
        programmingLanguages: repositoryData.tags
          .filter((tag) => tag[0] === 'l' && tag[2] === 'programming-languages')
          .map((tag) => ({ label: tag[1], value: tag[1] })),
        nips: repositoryData.tags
          .filter((tag) => tag[0] === 'l' && tag[2] === 'NIP')
          .map((tag) => ({ label: tag[1], value: tag[1] })),
      };
      setInitialValues(initialValuesInFunction);
    }
  };

  useEffect(() => {
    if (naddr) {
      getRepositoryForEdit();
    } else {
      setInitialValues({
        name: '',
        description: '',
        link: '',
        tags: [],
        license: '',
        programmingLanguages: [],
        nips: [],
      });
    }
  }, [naddr]);

  const isDuplicate = (newValue, values) => {
    return values.some((item) => item.label === newValue);
  };

  const MultiValueLabel = ({ data }) => {
    return <div className="multi-value-label-repo-form">{data.value}</div>;
  };

  return (
    <Container>
      <Row>
        <Col>
          <h4 className="mt-5">Create repository</h4>
          <Formik
            enableReinitialize={true}
            validationSchema={validationSchemaForFormAddApp}
            initialValues={initialValues}
            onSubmit={handleSubmitHandler}
          >
            {({ handleSubmit, touched, errors, setFieldValue, values }) => (
              <>
                <Form.Group>
                  <Form.Label className="mb-1 mt-3">Name</Form.Label>
                  <Field
                    id="name"
                    itemID="name"
                    as={Form.Control}
                    type="text"
                    name="name"
                    className={touched.name && errors.name ? 'is-invalid' : ''}
                  />
                  {errors?.name ? (
                    <div className="text-danger mt-1">{errors?.name}</div>
                  ) : null}
                </Form.Group>

                <Form.Group>
                  <Form.Label className="mb-1 mt-3">Description</Form.Label>
                  <TextAreaAutosize
                    id="description"
                    minRows={3}
                    className={
                      touched.description && errors.description
                        ? 'form-control is-invalid'
                        : 'form-control'
                    }
                    name="description"
                    value={values.description}
                    onChange={(e) => {
                      setFieldValue('description', e.target.value);
                    }}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="mb-1 mt-3">Author</Form.Label>
                  <Field
                    id="author"
                    itemID="author"
                    as={Form.Control}
                    type="text"
                    name="author"
                    placeholder="Author npub, or leave blank if you are the author"
                    className={
                      touched.author && errors.author ? 'is-invalid' : ''
                    }
                  />
                  {errors?.author ? (
                    <div className="text-danger mt-1">{errors?.author}</div>
                  ) : null}
                </Form.Group>
                <Form.Group>
                  <Form.Label className="mb-1 mt-3">Link</Form.Label>
                  <Field
                    className={touched.link && errors.link ? 'is-invalid' : ''}
                    as={Form.Control}
                    id="link"
                    type="text"
                    name="link"
                  />
                  {errors?.link ? (
                    <div className="text-danger mt-1">{errors?.link}</div>
                  ) : null}
                </Form.Group>
                <Form.Group>
                  <Form.Label className="mb-1 mt-3">
                    Programming Languages
                  </Form.Label>
                  <CreatableSelect
                    isMulti
                    minMenuHeight={500}
                    name="colors"
                    options={programmingLanguages}
                    classNamePrefix="select"
                    value={values.programmingLanguages}
                    onChange={(selectedOptions) =>
                      setFieldValue('programmingLanguages', selectedOptions)
                    }
                    className="basic-multi-select"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        e.preventDefault();
                        const newLanguageLabel = e.target.value;
                        if (
                          !isDuplicate(
                            newLanguageLabel,
                            values.programmingLanguages
                          )
                        ) {
                          const language = {
                            value: newLanguageLabel,
                            label: newLanguageLabel,
                          };
                          setFieldValue('programmingLanguages', [
                            ...values.programmingLanguages,
                            language,
                          ]);
                        }
                        setTempLanguage('');
                      }
                    }}
                    onInputChange={(newValue) => setTempLanguage(newValue)}
                    inputValue={tempLanguage}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="mb-1 mt-3">Tags</Form.Label>
                  <CreatableSelect
                    isMulti
                    name="tags"
                    options={[]}
                    classNamePrefix="select"
                    value={values.tags}
                    onChange={(selectedOptions) =>
                      setFieldValue('tags', selectedOptions)
                    }
                    className="basic-multi-select"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        e.preventDefault();
                        const newTagLabel = e.target.value;
                        if (!isDuplicate(newTagLabel, values.tags)) {
                          const tag = {
                            value: newTagLabel,
                            label: newTagLabel,
                          };
                          setFieldValue('tags', [...values.tags, tag]);
                        }
                        setTempTag('');
                      }
                    }}
                    onInputChange={(newValue) => setTempTag(newValue)}
                    inputValue={tempTag}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="mb-1 mt-3">Supported NIPs</Form.Label>
                  <CreatableSelect
                    isMulti
                    name="nips"
                    options={optionsNips}
                    classNamePrefix="select"
                    value={values.nips}
                    onChange={(selectedOptions) =>
                      setFieldValue('nips', selectedOptions)
                    }
                    components={{
                      MultiValueLabel,
                    }}
                    className="basic-multi-select"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        e.preventDefault();
                        const newTagLabel = e.target.value;
                        if (!isDuplicate(newTagLabel, values.nips)) {
                          const tag = {
                            value: newTagLabel,
                            label: newTagLabel,
                          };
                          setFieldValue('nips', [...values.nips, tag]);
                          setTempNipValue('');
                        }
                      }
                    }}
                    onInputChange={(newValue) => setTempNipValue(newValue)}
                    inputValue={tempNipValue}
                  />
                  {errors?.nips ? (
                    <div className="text-danger mt-1">
                      Please enter a valid NIP in the format "NIP-xx
                    </div>
                  ) : null}
                </Form.Group>

                <Form.Group>
                  <Form.Label className="mb-1 mt-3">License</Form.Label>
                  <CreatableSelect
                    name="license"
                    options={optionsLicensies}
                    classNamePrefix="select"
                    value={values.license}
                    onChange={(selectedOption) =>
                      setFieldValue('license', selectedOption)
                    }
                    className="basic-multi-select"
                  />
                </Form.Group>
                <div className="mt-4">
                  <Button
                    onClick={() => navigate(appsUrl)}
                    variant="secondary"
                    size="lg"
                    className="btn-block"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    size="lg"
                    className="mx-3 btn-block"
                  >
                    Save
                  </Button>
                </div>
              </>
            )}
          </Formik>
        </Col>
      </Row>
    </Container>
  );
};

export default CodeRepositoryForm;
