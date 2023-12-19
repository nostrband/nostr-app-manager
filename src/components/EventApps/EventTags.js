import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventTags = ({ tags }) => {
  const navigate = useNavigate();
  return (
    <div className="d-flex flex-wrap">
      <strong>Tags:</strong>
      {tags.map((t) => {
        return (
          <span
            class="pointer tag-event-apps mx-1"
            onClick={() => navigate(`/tag/${t}`)}
            key={t}
          >
            #{t}
          </span>
        );
      })}
    </div>
  );
};

export default EventTags;
