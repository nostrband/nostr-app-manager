import React, { useState } from 'react';

import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';

import * as cmn from '../common';

const AddKind = (props) => {
  const onSubmit = (kind) => {
    props.onSelect(kind);
  };

  const CustomMenu = React.forwardRef(
    ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
      const [value, setValue] = useState('');

      return (
        <div
          ref={ref}
          style={style}
          className={className}
          aria-labelledby={labeledBy}
        >
          <div>{React.Children.toArray(children)}</div>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(value);
            }}
          >
            <Form.Control
              autoFocus
              className="mx-3 my-2 w-auto"
              placeholder="Other kind"
              type="number"
              onChange={(e) => setValue(e.target.value)}
              value={value}
            />
          </Form>
        </div>
      );
    }
  );

  return (
    <Dropdown className="d-inline" drop="up">
      <Dropdown.Toggle variant="outline-primary">Add</Dropdown.Toggle>

      <Dropdown.Menu as={CustomMenu}>
        {Object.keys(cmn.getKinds()).map((k) => (
          <Dropdown.Item eventKey={k} key={k} onClick={(e) => onSubmit(k)}>
            {cmn.getKinds()[k]} ({k})
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AddKind;
