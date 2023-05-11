import React from 'react';
import './App.scss';
import ThemeProvider from 'react-bootstrap/ThemeProvider'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useEffect } from "react";

import Header from "./components/Header";
import Body from "./components/Body";
import Footer from "./components/Footer";

function App() {

  return(
    <ThemeProvider>
      <Container className="App mt-5">
        <Row>
          <Col><Header /></Col>
        </Row>
        <Row>
          <Col><Body /></Col>
        </Row>
        <Row>
          <Col><Footer /></Col>
        </Row>
      </Container>
    </ThemeProvider>
  )
}

export default App;
