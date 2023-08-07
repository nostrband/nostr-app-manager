import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const FindApps = ({ setLink, link, open, go }) => {
  return (
    <div>
      <h1>Paste a Nostr link to find an app:</h1>
      <Container className="ps-0 pe-0">
        <Row>
          <Col>
            <Form>
              <InputGroup className="mb-3">
                <Form.Control
                  placeholder="Enter npub, note, nevent, nprofile, naddr or any nostr app link"
                  aria-label="Nostr link"
                  aria-describedby="basic-go"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />

                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip>View event and a list of suggested apps.</Tooltip>
                  }
                >
                  <Button
                    variant="outline-primary"
                    id="button-go"
                    onClick={open}
                  >
                    Show apps
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip>
                      Redirect to the app if you've already saved one. Just
                      press 'Enter'.
                    </Tooltip>
                  }
                >
                  <Button
                    variant="outline-primary"
                    id="button-go"
                    type="submit"
                    onClick={go}
                  >
                    <i className="bi bi-arrow-right-short"></i>
                  </Button>
                </OverlayTrigger>
              </InputGroup>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FindApps;
