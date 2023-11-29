import React from 'react';
import Zap from '../../icons/Zap';
import Heart from '../../icons/Heart';
import LikedHeart from '../../icons/LikedHeart';
import Share from '../../icons/Share';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import UnCheckedStar from '../../icons/UnCheckedStar';
import CheckedStar from '../../icons/CheckedStar';
import { useParams, Link } from 'react-router-dom';
import * as cmn from '../../common';

const AppInfoActions = ({
  likeCount,
  zapCount,
  shareCount,
  handleLike,
  liked,
  openShareAppModalAndSetText,
  openReviewModalHandler,
  countReview,
  review,
}) => {
  const { naddr, activeTab } = useParams();

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip className="tooltip-zap">Total zap amount</Tooltip>}
      >
        <div className="zap count-block">
          <span className="font-weight-bold">{cmn.formatNumber(zapCount)}</span>
          <a
            href={`https://zapper.nostrapps.org/zap?id=${naddr}`}
            target="_blank"
          >
            <Zap />
          </a>
        </div>
      </OverlayTrigger>

      <OverlayTrigger
        placement="top"
        overlay={<Tooltip className="tooltip-like">Number of likes</Tooltip>}
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
        overlay={<Tooltip className="tooltip-share">Number of shares</Tooltip>}
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
        <Link
          to={
            cmn.localGet('loginPubkey') ? `/a/${naddr}/${activeTab}/review` : ''
          }
        >
          <div onClick={openReviewModalHandler} className="review count-block">
            <span className="font-weight-bold" style={{ color: '#FFC700' }}>
              {review ? countReview : '+'}
            </span>
            {review ? <CheckedStar /> : <UnCheckedStar />}
          </div>
        </Link>
      </OverlayTrigger>
    </>
  );
};

export default AppInfoActions;
