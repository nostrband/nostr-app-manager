import Logo from '../../icons/Logo';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, useLocation } from 'react-router-dom';

const HeaderForEventPage = () => {
  const { pathname } = useLocation();

  const goHome = () => {
    setTimeout(() => {
      window.dispatchEvent(new Event('goHome'));
    }, 0);
  };

  return (
    <header className="pt-3">
      <Row>
        <Col className="d-flex align-items-center justify-content-between">
          <h4>
            <Link
              className="logo"
              to={`${pathname !== '/' ? '/' : ''}`}
              onClick={goHome}
            >
              <Logo /> <span className="logo-text">App Manager</span>
            </Link>
          </h4>
          <a target="blank" href="https://nostr.how/">
            <h4>What is Nostr?</h4>
          </a>
        </Col>
      </Row>
    </header>
  );
};

export default HeaderForEventPage;
