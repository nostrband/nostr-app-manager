import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

const LoadingSpinner = ({ removeSpace }) => {
  return (
    <div
      className={`d-flex justify-content-center ${removeSpace ? '' : 'mt-3'}`}
    >
      <Spinner animation="border" className="text-primary" />
    </div>
  );
};

export default LoadingSpinner;
