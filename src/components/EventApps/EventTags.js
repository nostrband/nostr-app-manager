import React from 'react';

const EventTags = ({ tags }) => {
  return (
    <div className="d-flex flex-wrap">
      <strong>Tags:</strong>
      {tags.map((t) => {
        return (
          <span class="pointer tag-event-apps mx-1" key={t}>
            #{t}
          </span>
        );
      })}
    </div>
  );
};

export default EventTags;
