import { useState, useEffect, useRef } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { BoxArrowUpRight, Lightning } from 'react-bootstrap-icons';
import * as cmn from '../common';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import Zap from '../icons/Zap';
import { nip19 } from '@nostrband/nostr-tools';
import Heart from '../icons/Heart';
import LikedHeart from '../icons/LikedHeart';
import Share from '../icons/Share';
import { useAuth } from '../context/ShowModalContext';
import ShareAppModal from './ShareAppModal';

const AppInfo = (props) => {
  const [showModal, setShowModal] = useState(false);
  const { setShowLogin } = useAuth();
  const [liked, setLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const npub = nip19?.npubEncode(props.app.pubkey);
  const app = props.app.profile;
  const editUrl = cmn.formatAppEditUrl(cmn.getNaddr(props.app));
  const zapButtonRef = useRef(null);
  const zapButtonRefByEmail = useRef(null);
  const [textForShare, setTextForShare] = useState('');
  const login = cmn.getLoginPubkey() ? cmn.getLoginPubkey() : '';

  const isAllowEdit = () => {
    return cmn.isAuthed() && cmn.getLoginPubkey() === props.app.pubkey;
  };

  const [allowEdit, setAllowEdit] = useState(isAllowEdit());
  useEffect(() => {
    cmn.addOnNostr(() => setAllowEdit(isAllowEdit()));
  }, [props.app]);

  const handleLike = async () => {
    if (login) {
      if (liked.length === 0) {
        const event = {
          kind: 7,
          tags: [
            ['p', props.app.pubkey],
            ['a', cmn.naddrToAddr(cmn.getNaddr(props.app))],
          ],
          content: '+',
        };
        try {
          await cmn.publishEvent(event);
          checkIfLiked();
        } catch (error) {
          console.error('Error publishing like:', error);
        }
      } else {
        const deletedEventWithLike = {
          kind: 5,
          pubkey: liked[0]?.pubkey,
          tags: [['e', liked[0]?.id]],
          content: 'Deleting the app',
        };
        try {
          const result = await cmn.publishEvent(deletedEventWithLike);
          if (result) {
            setLiked([]);
          }
        } catch (error) {
          console.error('Error publishing like:', error);
        }
      }
    } else {
      setShowLogin(true);
    }
  };

  const checkIfLiked = async () => {
    const ndk = await cmn.getNDK();
    if (cmn.isAuthed()) {
      const addr = cmn.naddrToAddr(cmn.getNaddr(props.app));
      const loginPubkey = cmn.getLoginPubkey() ? cmn.getLoginPubkey() : '';
      const addrForFilter = {
        kinds: [7],
        '#a': [addr],
        authors: [loginPubkey],
      };

      try {
        const result = await cmn.fetchAllEvents([
          cmn.startFetch(ndk, addrForFilter),
        ]);
        if (result.length > 0) {
          setLiked(result);
        } else {
          setLiked([]);
        }
      } catch (error) {
        console.error('Error fetching liked status:', error);
      }
    }
  };

  useEffect(() => {
    checkIfLiked();
  }, []);

  useEffect(() => {
    if (zapButtonRef.current) {
      window.nostrZap.initTarget(zapButtonRef.current);
    }
    if (zapButtonRefByEmail.current) {
      window.nostrZap.initTarget(zapButtonRefByEmail.current);
    }
  }, []);

  const openShareAppModalAndSetText = () => {
    if (login) {
      const naddr = cmn.getNaddr(props.app);
      setShowShareModal(true);
      setTextForShare(
        `Check out ${props.app.profile.display_name} - ${props.app.profile.about}
  https://nostrapp.link/a/${naddr}`
      );
    } else {
      setShowLogin(true);
    }
  };

  return (
    <div className="AppInfo">
      <Row>
        <Col>
          <div className="me-auto">
            <h1>{app.display_name || app.name}</h1>
            {app.website && (
              <div className="text-muted">
                <BoxArrowUpRight className="me-2" />
                <a href={app.website} target="_blank" rel="noopener noreferrer">
                  {app.website}
                </a>
              </div>
            )}
            {app.lud16 && (
              <div
                data-npub={npub}
                ref={zapButtonRefByEmail}
                className="text-muted pointer lud-16"
              >
                <Lightning className="me-2" />
                <span>{app.lud16}</span>
              </div>
            )}
            <div className="mt-2 description">{app.about}</div>
            {app.banner && (
              <div className="mt-2">
                <a href={app.banner} target="_blank" rel="noopener noreferrer">
                  <img alt="" src={app.banner} className="banner w-100" />
                </a>
              </div>
            )}
          </div>
        </Col>
        <Col xs="auto">
          <div className="d-flex flex-column align-items-center">
            {app.picture && (
              <img
                alt=""
                className="profile mb-3"
                width="64"
                height="64"
                src={app.picture}
              />
            )}
            {app.lud16 ? <Zap zapRef={zapButtonRef} dataNpub={npub} /> : null}
            {liked.length > 0 ? (
              <LikedHeart onClick={handleLike} />
            ) : (
              <Heart onClick={handleLike} />
            )}
            <Share onClick={openShareAppModalAndSetText} />
          </div>

          {allowEdit && (
            <div>
              <div className="mt-2 d-flex justify-content-center">
                <Link className="w-100" to={editUrl}>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="w-100"
                  >
                    Edit
                  </Button>
                </Link>
              </div>
              <Button
                onClick={() => setShowModal(true)}
                size="sm"
                className="btn-danger w-100 mt-2"
              >
                Delete
              </Button>
            </div>
          )}
        </Col>
      </Row>
      {allowEdit ? (
        <ConfirmDeleteModal
          showModal={showModal}
          handleCloseModal={() => setShowModal(false)}
          selectedApp={props?.app}
        />
      ) : null}
      <ShareAppModal
        setTextForShare={setTextForShare}
        showModal={showShareModal}
        handleCloseModal={() => setShowShareModal(false)}
        selectedApp={props.app}
        textForShare={textForShare}
      />
    </div>
  );
};

export default AppInfo;
