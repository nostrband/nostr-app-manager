import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import RepositoriesBySearch from './Search/RepositoriesBySearch';
import AppsBySearch from './Search/AppsBySearch';

const tabs = [
  {
    title: 'Apps',
    path: 'apps',
  },
  {
    title: 'Repositories',
    path: 'repos',
  },
];

const SearchResultApps = () => {
  const [activeComponent, setActiveComponent] = useState('apps');

  const renderComponents = {
    apps: <AppsBySearch />,
    repos: <RepositoriesBySearch />,
  };

  return (
    <Container className="ps-0 pe-0">
      <ul className="nav nav-pills d-flex justify-content-center">
        {tabs.map((nav) => {
          return (
            <li
              onClick={() => {
                setActiveComponent(nav.path);
              }}
              className={`pointer nav-link nav-item ${
                activeComponent === nav.path ? 'active' : ''
              }`}
            >
              {nav.title}
            </li>
          );
        })}
      </ul>
      {renderComponents[activeComponent]}
    </Container>
  );
};

export default SearchResultApps;
