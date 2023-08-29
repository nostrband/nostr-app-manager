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
        const pubkeys = response.map((item) => item.pubkey);
        const filter = {
          kinds: [0],
          authors: pubkeys,
        };
        try {
          const authors = await cmn.fetchAllEvents([
            cmn.startFetch(ndk, filter),
          ]);
          const data = response.map((item) => {
            const author = authors.find(
              (author) => author.pubkey === item.pubkey
            );
            if (author) {
              return { ...item, author };
            } else {
              return item;
            }
          });
          setState((prev) => ({ ...prev, data }));
        } catch (error) {
          console.error('Error fetching authors:', error);
        }
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

  const emojifyContent = (content, tags) => {
    if (!content.includes(':')) {
      return content;
    }

    tags.forEach((tag) => {
      if (tag[0] === 'emoji') {
        const shortcode = `:${tag[1]}:`;
        const imageUrl = tag[2];
        content = content.replace(
          shortcode,
          `<img src="${imageUrl}" alt="${tag[1]}" style="width: 30px; height: 30px;" />`
        );
      }
    });
    return content;
  };

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
              const emojifiedContent = emojifyContent(like.content, like.tags);
              return (
                <ListGroupItem
                  key={like.pubkey}
                  className="darked d-flex align-items-center justify-content-between"
                >
                  <Profile small profile={{ profile }} pubkey={like.pubkey} />
                  {emojifiedContent === '+' ? (
                    <LikedHeart />
                  ) : (
                    <div
                      className="emojy"
                      dangerouslySetInnerHTML={{ __html: emojifiedContent }}
                    />
                  )}
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
                  <Profile small profile={{ profile }} pubkey={share.pubkey} />
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
