import React, { useEffect, useState } from 'react';
import { Container, OverlayTrigger } from 'react-bootstrap';
import * as cmn from '../../common';
import * as cs from '../../const';
import { BoxArrowUpRight } from 'react-bootstrap-icons';
import Tooltip from 'react-bootstrap/Tooltip';
import LikedHeart from '../../icons/LikedHeart';
import Heart from '../../icons/Heart';
import Zap from '../../icons/Zap';
import Share from '../../icons/Share';

const AppAddedOfTheDay = () => {
  const [appOfTheDay, setAppOfTheDay] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [zapCount, setZapCount] = useState(0);

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

  const getApps = async () => {
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
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getApps();
  }, []);

  return (
    <div className="pt-3">
      <Container className="ps-0 pe-0">
        {appOfTheDay ? (
          <>
            <h2>App of the day</h2>
            <div className=" d-flex justify-content-between">
              <div className="d-flex">
                <div className="mx-2">
                  <h4 style={{ margin: '0 !important' }}>
                    {appOfTheDay?.content?.name}
                  </h4>
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
                </div>
              </div>

              <div className="counts-app-on-home-page">
                <img
                  alt=""
                  className="profile"
                  width="70"
                  height="70"
                  // src={appOfTheDay.content.image}
                  src="https://nostrudel.ninja/apple-touch-icon.png"
                />
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip className="tooltip-like">Number of likes</Tooltip>
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
                    <Tooltip className="tooltip-zap">Total zap amount</Tooltip>
                  }
                >
                  <div>
                    <a
                      href={`https://zapper.nostrapps.org/zap?id=${cmn.getNaddr(
                        appOfTheDay
                      )}`}
                      target="_blank"
                    >
                      <Zap />
                    </a>
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
      </Container>
    </div>
  );
};

export default AppAddedOfTheDay;
