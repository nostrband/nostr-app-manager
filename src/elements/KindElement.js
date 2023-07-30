import React from 'react';

const KindElement = ({ children, props }) => {
  return (
    <div {...props} className="kind-element">
      {children}
    </div>
  );
};

export default KindElement;
