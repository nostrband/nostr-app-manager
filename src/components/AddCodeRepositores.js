import React from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import { validationSchemaForFormAddApp } from '../const';

const initialValues = {
  name: '',
  description: '',
  link: '',
  tags: '',
  license: '',
  programmingLanguages: '',
};

const handleSubmit = (values) => {
  const event = {
    kind: 30117,
    title: ['title', values.name],
    description: ['description', values.description],
    r: ['r', values.link],
    t: ['t', ...values.tags.split(',').map((tag) => tag.trim())], // Split tags and remove extra spaces
    license: ['license', values.license],
    d: Date.now(),
  };

  // You can do something else with the event data, e.g., send it to the server
  console.log('Event:', event);
};

const CodeRepositoryForm = () => {
  return (
    <Container>
      <Row>
        <Col>
          <Formik
            validationSchema={validationSchemaForFormAddApp}
            initialValues={initialValues}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit, touched, errors }) => (
              <Form onSubmit={handleSubmit}>
                {console.log({ touched, errors }, 'TOUCHED')}
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Field
                    as={Form.Control}
                    type="text"
                    name="name"
                    className={touched.name && errors.name ? 'is-invalid' : ''}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Field
                    as={Form.Control}
                    type="text"
                    name="description"
                    className={
                      touched.description && errors.description
                        ? 'is-invalid'
                        : ''
                    }
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Link</Form.Label>
                  <Field
                    as={Form.Control}
                    type="text"
                    name="link"
                    className={touched.link && errors.link ? 'is-invalid' : ''}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Tags (comma-separated)</Form.Label>
                  <Field
                    as={Form.Control}
                    type="text"
                    name="tags"
                    className={touched.tags && errors.tags ? 'is-invalid' : ''}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>License</Form.Label>
                  <Field
                    as={Form.Control}
                    type="text"
                    name="license"
                    className={
                      touched.license && errors.license ? 'is-invalid' : ''
                    }
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Programming Languages</Form.Label>
                  <Field
                    as={Form.Control}
                    type="text"
                    name="programmingLanguages"
                    className={
                      touched.programmingLanguages &&
                      errors.programmingLanguages
                        ? 'is-invalid'
                        : ''
                    }
                  />
                </Form.Group>
                {Object.keys(touched).length > 0 && // Check if any field is touched
                  Object.keys(errors).length > 0 && ( // Check if any field has an error
                    <div className="text-danger mt-3">
                      Please fill in all fields.
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
