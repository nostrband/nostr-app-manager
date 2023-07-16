import React from 'react';

import Dropdown from 'react-bootstrap/Dropdown';

import * as cmn from '../common';

const AddHandler = (props) => {
  const onSelect = (platform) => {
    props.onSelect(platform);
  };

  return (
    <Dropdown className="d-inline" onSelect={onSelect}>
      <Dropdown.Toggle drop="up" variant="outline-primary">
        Add handler
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {cmn.getPlatforms().map((p) => (
          <Dropdown.Item eventKey={p} key={p}>
            {p}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AddHandler;
