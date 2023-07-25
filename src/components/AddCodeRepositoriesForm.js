import React, { useRef } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Formik, Field } from 'formik';
import {
  optionsLicensies,
  programmingLanguages,
  validationSchemaForFormAddApp,
} from '../const';
import CreatableSelect from 'react-select/creatable';

const initialValues = {
  name: '',
  description: '',
  link: '',
  tags: [],
  license: '',
  programmingLanguages: [],
};

const handleSubmit = (values) => {
  const event = {
    kind: 30117,
    tags: [
      ['title', values.name],
      ['description', values.description],
      ['r', values.link],
      ['license', values.license.value],
      ...values.tags.map((tag) => ['t', tag.label]),
      ...values.programmingLanguages.map((lang) => ['t', lang.label]),
    ],
    d: Date.now(),
    content: '',
  };

  event.tags = event.tags.filter((tag) => tag[1]);
  console.log('Event:', event);
};

const CodeRepositoryForm = () => {
  const textareaRef = useRef(null);
  const updateTextareaHeight = () => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = '64px';
      const taHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = taHeight + 'px';
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <h4 className="mt-5">Create repository</h4>
          <Formik
            validationSchema={validationSchemaForFormAddApp}
            initialValues={initialValues}
            onSubmit={handleSubmit}
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
                  <Field as={Form.Control} id="link" type="text" name="link" />
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
                        const tag = {
                          value: e.target.value,
                          label: e.target.value,
                        };
                        setFieldValue('tags', [...values.tags, tag]);
                      }
                    }}
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
                <Form.Group>
                  <Form.Label className="mt-2">
                    Programming Languages
                  </Form.Label>
                  <CreatableSelect
                    isMulti
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
                        const language = {
                          value: e.target.value,
                          label: e.target.value,
                        };
                        setFieldValue('programmingLanguages', [
                          ...values.programmingLanguages,
                          language,
                        ]);
                      }
                    }}
                  />
                </Form.Group>

                {Object.keys(touched).length > 0 &&
                  Object.keys(errors).length > 0 && (
                    <div className="text-danger mt-3">
                      Please fill in the required fields, please.
                    </div>
                  )}

                <div className="mt-2">
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
