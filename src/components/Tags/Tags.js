import React, { useState } from 'react';
import AppsByTag from './AppsByTag';
import RepositoriesByTag from './RepositoriesByTag';

const tabs = [
  {
    title: 'Apps',
    path: 'apps',
  },
  {
    title: 'Repositories',
    path: 'repositories',
  },
];

const components = {
  apps: <AppsByTag />,
  repositories: <RepositoriesByTag />,
};

const Tags = () => {
  const [activeNav, setActiveNav] = useState('apps');

  return (
    <div className="mt-3">
      <ul className="nav nav-pills d-flex justify-content-center mb-3">
        {tabs.map((nav) => {
          return (
            <li
              onClick={() => {
                setActiveNav(nav.path);
              }}
              className={`pointer nav-link nav-item ${
                activeNav === nav.path ? 'active' : ''
              }`}
            >
              {nav.title}
            </li>
          );
        })}
      </ul>
      {components[activeNav]}
    </div>
  );
};

export default Tags;
