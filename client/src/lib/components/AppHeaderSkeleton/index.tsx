import React from 'react';
import { Layout } from 'antd';

import logo from './assets/tinyhouse-logo.png';

import './styles/AppHeaderSkeleton.css';

const { Header } = Layout;

export const AppHeaderSkeleton = (): JSX.Element => {
  return (
    <Header className="app-header">
      <div className="app-header__logo-search-section">
        <div className="app-header__logo">
          <img src={logo} alt="App logo" />
        </div>
      </div>
    </Header>
  );
};
