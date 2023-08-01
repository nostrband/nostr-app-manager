import React, { useRef, useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Formik, Field } from 'formik';
import {
  optionsLicensies,
  programmingLanguages,
  validationSchemaForFormAddApp,
} from '../const';
import * as cmn from '../common';
import CreatableSelect from 'react-select/creatable';
import { useNavigate, useParams } from 'react-router-dom';

const CodeRepositoryForm = () => {
  const { naddr } = useParams();
  const [tempTag, setTempTag] = useState('');
  const [tempLanguage, setTempLanguage] = useState('');
  const [initialValues, setInitialValues] = useState({
    name: '',
    description: '',
    link: '',
    tags: [],
    license: '',
    programmingLanguages: [],
  });

  const [identifier, setIdentifier] = useState('');

  const navigate = useNavigate();

  const textareaRef = useRef(null);
  const updateTextareaHeight = () => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = '64px';
      const taHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = taHeight + 'px';
    }
  };

  const handleSubmitHandler = async (values) => {
    const d = '' + Date.now().toString();
    const descriptionWithLineBreaks = values.description.replace(/\n/g, '<br>');
    const event = {
      kind: 30117,
      tags: [
        ['title', values.name],
        ['description', descriptionWithLineBreaks],
        ['r', values.link],
        ['license', values?.license?.value],
        ['d', d],
        ...values.tags.map((tag) => ['t', tag.label]),
        ...values.programmingLanguages.map((lang) => [
          'l',
          lang.label,
          'programming-languages',
        ]),
        ['L', 'programming-languages'],
      ],
      content: '',
    };
    event.tags = event.tags.filter((tag) => tag[1]);
    const result = await cmn.publishEvent(event);

    const naddr = cmn.formatNaddr({
      kind: 30117,
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

      const initialValuesInFunction = {
        name: repositoryData.tags.find((tag) => tag[0] === 'title')[1] || '',
        description: findTagValue('description'),
        link: findTagValue('r'),
        license: optionsLicensies.find(
          (option) => option.value === findTagValue('license')
        ),
        tags: repositoryData.tags
          .filter((tag) => tag[0] === 't')
          .map((tag) => ({ label: tag[1], value: tag[1] })),
        programmingLanguages: repositoryData.tags
          .filter((tag) => tag[0] === 'l')
          .map((tag) => ({ label: tag[1], value: tag[1] })),
      };
      console.log(initialValues, 'INITIAL VALUES');
      setInitialValues(initialValuesInFunction);
    }
  };

  useEffect(() => {
    if (naddr) {
      getRepositoryForEdit();
    }
  }, []);

  const isDuplicate = (newValue, values) => {
    return values.some((item) => item.label === newValue);
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
                  <Form.Label className="mt-2">Name</Form.Label>
                  <Field
                    id="name"
                    itemID="name"
                    as={Form.Control}
                    type="text"
                    name="name"
                    className={touched.name && errors.name ? 'is-invalid' : ''}
                  />
                  <div className="text-danger mt-1">{errors?.name}</div>
                </Form.Group>

                <Form.Group>
                  <Form.Label className="mt-2">Description</Form.Label>
                  <textarea
                    id="description"
                    rows={2}
                    ref={textareaRef}
                    className={
                      touched.description && errors.description
                        ? 'form-control is-invalid'
                        : 'form-control'
                    }
                    name="description"
                    value={values.description}
                    onChange={(e) => {
                      setFieldValue('description', e.target.value);
                      updateTextareaHeight();
                    }}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className="mt-2">Link</Form.Label>
                  <Field
                    className={touched.link && errors.link ? 'is-invalid' : ''}
                    as={Form.Control}
                    id="link"
                    type="text"
                    name="link"
                  />
                  <div className="text-danger mt-1">{errors?.link}</div>
                </Form.Group>
                <Form.Group>
                  <Form.Label className="mt-2">
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
                  <Form.Label className="mt-2">Tags</Form.Label>
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
                  <Form.Label className="mt-2">License</Form.Label>
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
                <div className="mt-3">
                  <Button variant="secondary" size="lg" className="btn-block">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    size="lg"
                    className="mx-2 btn-block"
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
