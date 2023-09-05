import React from 'react';

const KindElement = ({ children, props }) => {
  return (
    <div {...props} className="kind-element mx-1 mb-1">
      {children}
    </div>
  );
};

export default KindElement;
