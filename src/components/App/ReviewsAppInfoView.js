import React, { useState, useEffect } from 'react';
import './ReviewsAppInfoView.scss';
import { Rating } from '@mui/material';
import * as cmn from '../../common';
import { ListGroupItem, ListGroup, Button } from 'react-bootstrap';
import RatingStatistics from './RatingStatistics';
import LoadingSpinner from '../../elements/LoadingSpinner';

const ReviewsAppInfoView = ({ app }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const getReviews = async () => {
    setLoading(true);
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
      if (response.length > 0) {
        const pubkeys = response.map((review) => review.pubkey);
        const filter = {
          kinds: [0],
          authors: pubkeys,
        };
        try {
          const authors = await cmn.fetchAllEvents([
            cmn.startFetch(ndk, filter),
          ]);
          const reviewsData = response.map((review) => {
            const author = authors.find(
              (author) => author.pubkey === review.pubkey
            );
            if (author) {
              return { ...review, author };
            } else {
              return review;
            }
          });
          setReviews((prev) => ({ ...prev, reviewsData }));
        } catch (error) {
          console.error('Error fetching authors:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getReviews();
  }, []);

  console.log(reviews, 'REVIEWS');

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ListGroup className="reviews-container">
          <RatingStatistics reviews={reviews} />
          {reviews?.reviewsData?.map((review) => {
            let count = cmn.getCountReview(review);
            return (
              <ListGroupItem key={review.pubkey} className="review-item darked">
                <p>{review.content}</p>
                <div className="d-flex justify-content-between">
                  {/* <div>
                 <img className="avatar" src={review.avatar} />
                 <span className="mx-2">{review.author}</span>
               </div> */}
                  <div></div>
                  <Rating name="read-only" value={count} readOnly />
                </div>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      )}
    </div>
  );
};

export default ReviewsAppInfoView;
