import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import './FindApps.scss';

const FindApps = ({ setLink, link, open, go }) => {
  return (
    <div>
      <Container className="ps-0 pe-0 find-apps-container">
        <h2>Paste a Nostr link to find an app:</h2>
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
                  className="find-apps-tooltip"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip-find-apps">
                      View events and a list of suggested apps.
                    </Tooltip>
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
                  className="find-apps-tooltip"
                  placement="bottom"
                  overlay={
                    <Tooltip className="tooltip-find-apps">
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
