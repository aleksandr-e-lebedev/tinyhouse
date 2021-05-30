import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { Input, Layout } from 'antd';

import { MenuItems } from './components';
import { Viewer } from '../../lib/types';
import { displayErrorMessage } from '../../lib/utils';

import logo from './assets/tinyhouse-logo.png';

import './styles/AppHeader.css';

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Header } = Layout;
const { Search } = Input;

export const AppHeader = ({ viewer, setViewer }: Props): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  const [search, setSearch] = useState('');

  useEffect(() => {
    const { pathname } = location;

    if (!pathname.includes('/listings')) {
      setSearch('');
      return;
    }

    const pathnameSubstrings = pathname.split('/');

    if (pathnameSubstrings.length === 3) {
      setSearch(pathnameSubstrings[2]);
    }
  }, [location]);

  const handleSearch = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue) {
      history.push(`/listings/${trimmedValue}`);
    } else {
      void displayErrorMessage('Please enter a valid search!');
    }
  };

  return (
    <Header className="app-header">
      <div className="app-header__logo-search-section">
        <div className="app-header__logo">
          <Link to="/">
            <img src={logo} alt="App logo" />
          </Link>
        </div>
        <div className="app-header__search-input">
          <Search
            placeholder="Search 'San Fransisco'"
            enterButton
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
      </div>
      <div className="app-header__menu-section">
        <MenuItems viewer={viewer} setViewer={setViewer} />
      </div>
    </Header>
  );
};
