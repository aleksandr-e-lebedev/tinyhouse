import React from 'react';
import { Card, Layout, Typography } from 'antd';

import googleLogo from './assets/google-logo.jpg';

import './styles/Login.css';

const { Content } = Layout;
const { Text, Title } = Typography;

export const Login = (): JSX.Element => {
  return (
    <Content className="log-in">
      <Card className="log-in-card">
        <div className="log-in-card__intro">
          <Title level={3} className="log-in-card__intro-title">
            <span role="img" aria-label="wave">
              👋
            </span>
          </Title>
          <Title level={3} className="log-in-card__intro-title">
            Log in to TinyHouse!
          </Title>
          <Text>Sign in with Google to start booking available rentals!</Text>
        </div>
        <button type="button" className="log-in-card__google-button">
          <img
            src={googleLogo}
            alt="Google Logo"
            className="log-in-card__google-button-logo"
          />
          <span className="log-in-card__google-button-text">
            Sign in with Google
          </span>
        </button>
        <Text type="secondary">
          Note: By signing in, you&apos;ll be redirected to the Google consent
          form to sign in with your Google account.
        </Text>
      </Card>
    </Content>
  );
};
