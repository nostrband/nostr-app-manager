import { useState, useEffect, useRef } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { BoxArrowUpRight, Lightning } from 'react-bootstrap-icons';
import * as cmn from '../../common';
import ConfirmDeleteModal from '../../elements/ConfirmDeleteModal';
import Zap from '../../icons/Zap';
import { nip19 } from '@nostrband/nostr-tools';
import Heart from '../../icons/Heart';
import LikedHeart from '../../icons/LikedHeart';
import Share from '../../icons/Share';
import { useAuthShowModal } from '../../context/ShowModalContext';
import ShareAppModal from './ShareAppModal';
import './AppInfo.scss';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import errorToast from '../../elements/ErrorToast';
import UnCheckedStar from '../../icons/UnCheckedStar';
import ReviewModal from './Reviews/ReviewModal';
import CheckedStar from '../../icons/CheckedStar';
import { useReviewModal } from '../../context/ShowReviewContext';

const AppInfo = (props) => {
  const [showModal, setShowModal] = useState(false);
  const { showReviewModal, setShowReviewModal } = useReviewModal();
  const { setShowLogin } = useAuthShowModal();
  const [liked, setLiked] = useState(false);
  const [review, setReview] = useState(false);
  const [countReview, setCountReview] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const npub = nip19?.npubEncode(props.app.pubkey);
  const authorTag = props.app.tags.find(
    (tag) => tag.length >= 4 && tag[0] === 'p' && tag[3] === 'author'
  );
  const npubAuthor = authorTag ? nip19.npubEncode(authorTag[1]) : null;
  const app = props.app.profile;
  const editUrl = cmn.formatAppEditUrl(cmn.getNaddr(props.app));
  const zapButtonRef = useRef(null);
  const zapButtonRefByEmail = useRef(null);
  const [textForShare, setTextForShare] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [zapCount, setZapCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);

  const isAllowEdit = () => {
    return cmn.isAuthed() && cmn.getLoginPubkey() === props.app.pubkey;
  };
  const [allowEdit, setAllowEdit] = useState(isAllowEdit());

  useEffect(() => {
    cmn.addOnNostr(() => setAllowEdit(isAllowEdit()));
  }, [props.app]);

  const handleLike = async () => {
    if (cmn.localGet('loginPubkey')) {
      if (liked.length === 0 || !liked) {
        const event = {
          kind: 7,
          tags: [
            ['p', props.app.pubkey],
            ['a', cmn.naddrToAddr(cmn.getNaddr(props.app))],
          ],
          content: '+',
        };
        const authorTag = props.app.tags.find(
          (tag) => tag.length >= 4 && tag[0] === 'p' && tag[3] === 'author'
        );
        if (authorTag) {
          event.tags.push(['p', authorTag[1], authorTag[2]]);
        }
        try {
          const response = await cmn.publishEvent(event);
          if (response) {
            setLikeCount((prev) => prev + 1);
          }
          checkIfLiked();
        } catch (error) {
          console.error('Error publishing like:', error);
        }
      } else {
        const deletedEventWithLike = {
          kind: 5,
          pubkey: cmn.localGet('loginPubkey'),
          tags: [['e', liked[0]?.id]],
          content: 'Deleting the app',
        };
        try {
          const result = await cmn.publishEvent(deletedEventWithLike);
          if (result) {
            setLiked([]);
            setLikeCount((prev) => prev - 1);
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

  const getCountReview = (review) => {
    if (review) {
      const filteredTags = review?.tags?.filter((tagArray) =>
        tagArray.includes('l')
      );
      const jsonString = filteredTags[0]?.find(
        (item) =>
          typeof item === 'string' && item.startsWith('{') && item.endsWith('}')
      );
      const jsonObj = JSON.parse(jsonString);
      const quality = jsonObj.quality;
      const originalReview = Math.round(quality * 5);
      setCountReview(originalReview);
    }
  };

  const hasReview = async () => {
    const ndk = await cmn.getNDK();
    if (cmn.isAuthed()) {
      const addr = cmn.naddrToAddr(cmn.getNaddr(props.app));
      const loginPubkey = cmn.getLoginPubkey() ? cmn.getLoginPubkey() : '';
      const addrForFilter = {
        kinds: [1985],
        '#a': [addr],
        authors: [loginPubkey],
      };
      try {
        const result = await cmn.fetchAllEvents([
          cmn.startFetch(ndk, addrForFilter),
        ]);
        if (result.length > 0) {
          setReview(result[result.length - 1]);
          getCountReview(result[result.length - 1]);
        }
      } catch (error) {
        console.error('Error fetching liked status:', error);
      }
    }
  };

  useEffect(() => {
    checkIfLiked();
    hasReview();
  }, [props.app]);

  const showZapError = () => {
    if (!app?.lud16) {
      errorToast('Lightning address not specified');
    }
  };

  useEffect(() => {
    if (zapButtonRef.current) {
      window.nostrZap.initTarget(zapButtonRef.current);
    }
    if (zapButtonRefByEmail.current) {
      window.nostrZap.initTarget(zapButtonRefByEmail.current);
    }
  }, []);

  const openShareAppModalAndSetText = () => {
    if (cmn.localGet('loginPubkey')) {
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
  const fetchCounts = async (kind, setStateFunction) => {
    try {
      const ndk = await cmn.getNDK();
      const addrForGetCountUser = cmn.naddrToAddr(cmn.getNaddr(props.app));
      const { count } = await ndk.fetchCount({
        kinds: [kind],
        '#a': [addrForGetCountUser],
      });
      setStateFunction(count);
    } catch (error) {
      console.log(error, 'ERROR');
    }
  };

  const fetchCountsLike = () => fetchCounts(7, setLikeCount);
  const fetchCountsZap = () => fetchCounts(9734, setZapCount);
  const fetchCountShared = () => fetchCounts(1, setShareCount);

  useEffect(() => {
    fetchCountsLike();
    fetchCountsZap();
    fetchCountShared();
  }, []);

  const openReviewModalHandler = () => {
    if (cmn.localGet('loginPubkey')) {
      setShowReviewModal(true);
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
            {app?.lud16 ? (
              <div
                onClick={showZapError}
                data-npub={authorTag ? npubAuthor : npub}
                ref={app?.lud16 ? zapButtonRefByEmail : null}
                className="text-muted pointer lud-16"
              >
                <Lightning className="me-2" />
                <span>{app.lud16}</span>
              </div>
            ) : null}
            <div className="mt-2 description">{app.about}</div>
            {app.banner && (
              <div className="mt-2">
                <a href={app.banner} target="_blank" rel="noopener noreferrer">
                  <img alt="" src={app.banner} className="banner w-100" />
                </a>
              </div>
            )}
          </div>
          {props.children}
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
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip className="tooltip-zap">Total zap amount</Tooltip>
              }
            >
              <div className="zap count-block">
                <span className="font-weight-bold">{zapCount}</span>
                <Zap
                  onClick={showZapError}
                  zapRef={app?.lud16 ? zapButtonRef : null}
                  dataNpub={authorTag ? npubAuthor : npub}
                />
              </div>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip className="tooltip-like">Number of likes</Tooltip>
              }
            >
              <div className="like count-block">
                <span className="font-weight-bold" style={{ color: '#b32322' }}>
                  {likeCount}
                </span>
                {liked.length > 0 ? (
                  <LikedHeart onClick={handleLike} />
                ) : (
                  <Heart onClick={handleLike} />
                )}
              </div>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip className="tooltip-share">Number of shares</Tooltip>
              }
            >
              <div className="share count-block">
                <span className="font-weight-bold" style={{ color: '#84b7ff' }}>
                  {shareCount}
                </span>
                <Share onClick={openShareAppModalAndSetText} />
              </div>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip className="tooltip-review">
                  Review for this application
                </Tooltip>
              }
            >
              <div
                onClick={openReviewModalHandler}
                className="review count-block"
              >
                <span className="font-weight-bold" style={{ color: '#FFC700' }}>
                  {review ? countReview : '+'}
                </span>
                {review ? <CheckedStar /> : <UnCheckedStar />}
              </div>
            </OverlayTrigger>
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

      {showReviewModal ? (
        <ReviewModal
          hasReview={hasReview}
          countReview={countReview}
          setReview={setReview}
          setCountReview={setCountReview}
          review={review}
          app={props.app}
          showModal={showReviewModal}
          handleCloseModal={() => setShowReviewModal(false)}
        />
      ) : null}
    </div>
  );
};

export default AppInfo;
