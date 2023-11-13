import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import * as cmn from '../../common';

const BountySchema = Yup.object().shape({
  satoshi: Yup.number()
    .required('Required')
    .min(1, 'Amount must be at least 1 Satoshi'),
  comment: Yup.string().required('Required'),
});

const BountyModal = ({
  show,
  handleClose,
  issueUrl,
  linkToRepo,
  topTenContributorPubkeys,
}) => {
  const sendBounty = async (values) => {
    const contributorTags = topTenContributorPubkeys.map((pubkey) => [
      'p',
      pubkey,
    ]);
    const event = {
      kind: 100119,
      content: values.comment,
      tags: [
        ['r', issueUrl],
        ['bounty', values.satoshi],
        ['a', linkToRepo],
        ...contributorTags,
      ],
    };
    return cmn.publishEvent(event);
  };

  const submitForm = async (values, { setSubmitting }) => {
    try {
      const response = await sendBounty(values);
      if (response) {
        handleClose();
      }
    } catch (error) {
      console.log('ERROR:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Bounty</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{ satoshi: '', comment: '' }}
          validationSchema={BountySchema}
          onSubmit={submitForm}
        >
          {({ handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Amount in Satoshi</Form.Label>
                  <Field
                    min={0}
                    name="satoshi"
                    type="number"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="satoshi"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Comment</Form.Label>
                  <Field
                    name="comment"
                    as="textarea"
                    rows={3}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="comment"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  Post Bounty
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default BountyModal;
