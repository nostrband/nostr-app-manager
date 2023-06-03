import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';

import * as cmn from "../common"

const KindButton = (props) => {

  const k = props.kind;  
  return (
    <ButtonGroup className="me-1">
      <Button variant="outline-primary">
	{(k in cmn.getKinds()) ? `${cmn.getKinds()[k]} (${k})` : k}	
      </Button>
      <Button variant="outline-primary" onClick={e => props.onRemove(k)}>x</Button>
    </ButtonGroup>
  )
}

export default KindButton;
