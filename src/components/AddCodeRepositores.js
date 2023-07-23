import React, { useRef, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Formik, Field, useFormik } from 'formik';
import { programmingLanguages, validationSchemaForFormAddApp } from '../const';
import Select from 'react-select';

const initialValues = {
  name: '',
  description: '',
  link: '',
  tags: '',
  license: '',
  programmingLanguages: [],
};

const handleSubmit = (values) => {
  const selectedLanguages = values.programmingLanguages.map((language) =>
    language.value.toLowerCase()
  );

  const tagsArray = values.tags
    .split(',')
    .map((tag) => tag.trim().toLowerCase());

  const tags = [
    ...(values.name ? [['title', values.name]] : []),
    ...(values.description ? [['description', values.description]] : []),
    ...(values.link ? [['r', values.link]] : []),
    ...(values.license ? [['license', values.license]] : []),
    ['d', Date.now()],
    ...selectedLanguages.map((language) => ['t', language]),
    ...tagsArray.map((tag) => ['t', tag]),
  ].filter((tag) => tag[1]);

  const tagKeys = tags.map((tag) => tag[0]);

  const tTags = [...new Set(tagKeys)]
    .filter((key) => key !== 't')
    .map((key) => ['t', key]);

  const event = {
    kind: 30117,
    tags: [...tags, ...tTags],
  };

  console.log('Event:', event);
};

const CodeRepositoryForm = () => {
  const textareaRef = useRef(null);

  const updateTextareaHeight = () => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const taHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = taHeight + 'px';
    }
  };

  const customStyles = {
    control: () => ({
      borderColor: 'red',
      boxShadow: '0 0 0 1px red',
      '&:hover': {
        borderColor: 'red',
      },
    }),
  };

  return (
    <Container>
      <Row>
        <Col>
          <Formik
            validationSchema={validationSchemaForFormAddApp}
            initialValues={initialValues}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit, touched, errors, setFieldValue, values }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
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
                  <Form.Label>Description</Form.Label>
                  <textarea
                    id="description"
                    rows={1}
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
                  <Form.Label>Link</Form.Label>
                  <Field as={Form.Control} id="link" type="text" name="link" />
                </Form.Group>

                <Form.Group>
                  <Form.Label>License</Form.Label>
                  <Field
                    id="license"
                    as={Form.Control}
                    type="text"
                    name="license"
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Programming Languages</Form.Label>
                  <Select
                    isMulti
                    name="colors"
                    options={programmingLanguages}
                    classNamePrefix="select"
                    value={values.programmingLanguages}
                    onChange={(selectedOptions) =>
                      setFieldValue('programmingLanguages', selectedOptions)
                    }
                    className="basic-multi-select"
                  />
                </Form.Group>
                {Object.keys(touched).length > 0 &&
                  Object.keys(errors).length > 0 && (
                    <div className="text-danger mt-3">
                      Please fill in the required fields, please.
                    </div>
                  )}
                <div className="mt-2">
                  <Button variant="secondary" size="md" className="btn-block">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="mx-2 btn-block"
                  >
                    Save
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Col>
      </Row>
    </Container>
  );
};

export default CodeRepositoryForm;
