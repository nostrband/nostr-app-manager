import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import * as cmn from '../../common';
import './RatingStatistics.scss';
import CheckedStar from '../../icons/CheckedStar';

const RatingStatistics = ({ reviews }) => {
  const totalReviews = reviews?.reviewsData?.length || 0;
  const ratingCounts = [0, 0, 0, 0, 0];

  reviews?.reviewsData?.forEach((review) => {
    const count = cmn.getCountReview(review);
    ratingCounts[count - 1]++;
  });

  const totalRating = ratingCounts.reduce(
    (sum, count, index) => sum + count * (index + 1),
    0
  );

  const averageRating = totalReviews ? totalRating / totalReviews : 0;
  return (
    <div className="rating-container">
      <div className="averate-rating">
        <span>{averageRating.toFixed(2)}</span>
        <CheckedStar />
      </div>

      <div className="rating-progressbar-container">
        {ratingCounts.map((count, index) => {
          const percentage = totalReviews ? (count / totalReviews) * 100 : 0;
          return (
            <div key={index} className="rating-progress-container">
              <label>{index + 1}</label>
              <CircularProgressbar
                value={percentage}
                text={`${Math.round(percentage)}%`}
                styles={buildStyles({
                  textColor: '#000',
                  pathColor: '#ffc700',
                  trailColor: '#eee',
                })}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingStatistics;
