import React, { useEffect, useState } from 'react';
import { Container, OverlayTrigger } from 'react-bootstrap';
import * as cmn from '../../common';
import * as cs from '../../const';
import { BoxArrowUpRight } from 'react-bootstrap-icons';
import Tooltip from 'react-bootstrap/Tooltip';
import Heart from '../../icons/Heart';
import Zap from '../../icons/Zap';
import Share from '../../icons/Share';
import { Link, useNavigate } from 'react-router-dom';
import RatingStatistics from '../App/RatingStatistics';
import LoadingSpinner from '../../elements/LoadingSpinner';

const AppAddedOfTheDay = () => {
  const [appOfTheDay, setAppOfTheDay] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [zapCount, setZapCount] = useState(0);
  const [tags, setTags] = useState([]);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const getUrl = (h) => cmn.formatAppUrl(cmn.getNaddr(h));

  const getStartOfDayTimestamp = () => {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    return Math.floor(startOfDay.getTime() / 1000);
  };

  const fetchCounts = async (kind, setStateFunction, event) => {
    try {
      const ndk = await cmn.getNDK();
      const addrForGetCountUser = cmn.naddrToAddr(cmn.getNaddr(event));
      const { count } = await ndk.fetchCount({
        kinds: [kind],
        '#a': [addrForGetCountUser],
      });

      setStateFunction(count);
    } catch (error) {
      console.log(error, 'ERROR');
    }
  };

  const getReviews = async (app) => {
    const ndk = await cmn.getNDK();
    const addr = cmn.naddrToAddr(cmn.getNaddr(app));
    const addrForFilter = {
      kinds: [1985],
      '#a': [addr],
    };
    try {
      const response = await cmn.fetchAllEvents([
        cmn.startFetch(ndk, addrForFilter),
      ]);

      setReviews({ reviewsData: response });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const getApps = async () => {
    setLoading(true);
    const ndk = await cmn.getNDK();
    try {
      const startOfDayTimestamp = getStartOfDayTimestamp();
      const filter = {
        kinds: [cs.KIND_HANDLERS],
        limit: 100,
        since: startOfDayTimestamp,
      };
      let response = await cmn.fetchAllEvents([cmn.startFetch(ndk, filter)]);
      if (response && response.length > 0) {
        let app = response[0];
        setAppOfTheDay({ ...app, content: JSON.parse(app?.content) });
        fetchCounts(7, setLikeCount, app);
        fetchCounts(1, setShareCount, app);
        const totalZapAmount = await cmn.fetchZapCounts(app);
        setZapCount(totalZapAmount / 1000);
        const tags = app.tags
          .filter((tag) => tag[0] === 't')
          .map((tag) => tag[1]);
        setTags(tags);
        getReviews(app);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getApps();
  }, []);

  return (
    <div className="pt-3">
      <h2>App of the day 🎉</h2>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Container className="ps-0 pe-0 app-added-of-the-day">
          {appOfTheDay ? (
            <>
              <div className="inner-block d-flex justify-content-between mb-2">
                <div className="d-flex">
                  <div className="mx-2">
                    <Link
                      className="app-title-on-home-page"
                      to={appOfTheDay ? getUrl(appOfTheDay) : ''}
                    >
                      <h4 style={{ margin: '0 !important' }}>
                        {appOfTheDay?.content?.name}
                      </h4>
                    </Link>

                    <div className="text-muted">
                      <BoxArrowUpRight className="me-2" />
                      <a
                        href="https://nostrdit.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        https://nostrdit.com
                      </a>
                    </div>
                    {appOfTheDay.content.about ? (
                      <div className="mt-2 description">
                        {appOfTheDay.content.about}
                      </div>
                    ) : null}
                    {tags.length > 0 ? <h6 className="mt-3">Tags:</h6> : null}
                    <div>
                      {tags.map((t) => {
                        return (
                          <button
                            class="btn btn-outline-primary mx-1 mt-1 mb-1"
                            onClick={() => navigate(`/tag/${t}`)}
                            key={t}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="counts-app-on-home-page">
                  <img
                    alt=""
                    className="profile"
                    width="70"
                    height="70"
                    src={
                      appOfTheDay.content.image || appOfTheDay.content.picture
                    }
                  />
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip className="tooltip-like">
                        Number of likes
                      </Tooltip>
                    }
                  >
                    <div>
                      <Heart />
                      <span
                        className="font-weight-bold"
                        style={{ color: '#b32322' }}
                      >
                        {likeCount}
                      </span>
                    </div>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip className="tooltip-zap">
                        Total zap amount
                      </Tooltip>
                    }
                  >
                    <div>
                      <Zap />
                      <span
                        style={{ color: '#9747ff' }}
                        className="font-weight-bold"
                      >
                        {cmn.formatNumber(zapCount)}
                      </span>
                    </div>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip className="tooltip-share">
                        Number of shares
                      </Tooltip>
                    }
                  >
                    <div>
                      <Share />
                      <span
                        className="font-weight-bold"
                        style={{ color: '#84b7ff' }}
                      >
                        {shareCount}
                      </span>
                    </div>
                  </OverlayTrigger>
                </div>
              </div>
            </>
          ) : null}
          {reviews.length > 0 ? <RatingStatistics reviews={reviews} /> : null}
        </Container>
      )}
    </div>
  );
};

export default AppAddedOfTheDay;
