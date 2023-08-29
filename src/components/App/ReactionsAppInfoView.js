import React, { useEffect, useState } from 'react';
import * as cmn from '../../common';
import LikedHeart from '../../icons/LikedHeart';
import { ListGroupItem, ListGroup } from 'react-bootstrap';
import Profile from '../../elements/Profile';
import './ReactionAppInfo.scss';
import LoadingSpinner from '../../elements/LoadingSpinner';

const ReacitonsAppInfoView = ({ app }) => {
  const [reactionLikesData, setReactionLikesData] = useState();
  const [reactionSharesData, setReactionSharesData] = useState();
  const [loading, setLoading] = useState(true);

  const getReactions = async (kind, setState) => {
    const ndk = await cmn.getNDK();
    const addr = cmn.naddrToAddr(cmn.getNaddr(app));
    const addrForFilter = {
      kinds: [kind],
      '#a': [addr],
    };
    try {
      const response = await cmn.fetchAllEvents([
        cmn.startFetch(ndk, addrForFilter),
      ]);
      if (response.length > 0) {
        const data = await Promise.all(
          response.map(async (item) => {
            const filter = {
              kinds: [0],
              authors: [item.pubkey],
            };
            try {
              const author = await cmn.fetchAllEvents([
                cmn.startFetch(ndk, filter),
              ]);
              if (item.pubkey === author[0].pubkey) {
                return { ...item, author: author[0] };
              } else {
                return item;
              }
            } catch (error) {
              return item;
            }
          })
        );
        setState((prev) => ({ ...prev, data }));
      }
    } catch (error) {
      console.error('Error fetching liked status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getReactions(7, setReactionLikesData);
    getReactions(1, setReactionSharesData);
  }, []);

  return (
    <div>
      {reactionLikesData?.data?.length > 0 ? <strong>Likes:</strong> : null}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <ListGroup className="mb-3">
            {reactionLikesData?.data?.map((like) => {
              const profile = like?.author?.content
                ? JSON.parse(like?.author?.content)
                : {};
              return (
                <ListGroupItem
                  key={like.pubkey}
                  className="darked d-flex align-items-center justify-content-between"
                >
                  <Profile profile={{ profile }} pubkey={like.pubkey} />
                  {like.content === '+' ? <LikedHeart /> : null}
                </ListGroupItem>
              );
            })}
          </ListGroup>
          {reactionSharesData?.data?.length > 0 ? (
            <strong>Shares:</strong>
          ) : null}
          <ListGroup className="mt-3">
            {reactionSharesData?.data?.map((share) => {
              const profile = share?.author?.content
                ? JSON.parse(share?.author?.content)
                : {};
              return (
                <ListGroupItem
                  key={share.pubkey}
                  className="darked share-like-item "
                >
                  <Profile profile={{ profile }} pubkey={share.pubkey} />
                  <p className="mb-0 mt-2 mx-2 limited-text">{share.content}</p>
                </ListGroupItem>
              );
            })}
          </ListGroup>
        </>
      )}
    </div>
  );
};

export default ReacitonsAppInfoView;
