import React from 'react';

const EventTags = ({ tags }) => {
  return (
    <div className="d-flex flex-wrap mt-1">
      <label className="tag-event-apps">Tags:</label>
      {tags.map((t) => {
        return (
          <span className="pointer tag-event-apps mx-1" key={t}>
            #{t}
          </span>
        );
      })}
    </div>
  );
};

export default EventTags;
