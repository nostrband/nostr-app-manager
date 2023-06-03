import { useState } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import * as cmn from "../common"

const HandlerUrl = (props) => {

  const [platform, setPlatform] = useState(props.url.platform || "");
  const [url, setUrl] = useState(props.url.url || "");
  const [type, setType] = useState(props.url.type || "");

  const onChange = () => {
    props.onChange(props.index, {
      ...props.url,
      platform,
      url,
      type
    });
  };

  const isInvalid = url !== "" && !url.includes("<bech32>");
  
  return (
    <>
      <td score="row">
	<Form.Select value={platform} onChange={e => setPlatform(e.target.value)} onBlur={onChange}>
	  {cmn.getPlatforms().map((p) => {
	    return (
	      <option key={p} value={p}>{p}</option>
	    )
	  })}
	</Form.Select>
      </td>
      <td>
	<Form.Control placeholder="" value={url}
	  isInvalid={isInvalid}
	  onChange={e => setUrl(e.target.value)} onBlur={onChange} />
      </td>
      <td>
	<Form.Select value={type} onChange={e => setType(e.target.value)} onBlur={onChange}>
	  {cmn.getTypes().map((type) => {
	    return (
	      <option key={type} value={type}>{type === "" ? "All" : type}</option>
	    )
	  })}
	</Form.Select>		
      </td>
      <td>
	<Button variant="outline-secondary" onClick={e => props.onRemove(props.index)}>x</Button>
      </td>
    </>
  );
};

export default HandlerUrl;
