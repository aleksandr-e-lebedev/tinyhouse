import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useApolloClient, useMutation } from '@apollo/client';
import { Card, Layout, Spin, Typography } from 'antd';

import { ErrorBanner } from '../../lib/components';

import { GOOGLE_AUTH_URL } from '../../lib/graphql/queries';
import { LOG_IN_WITH_GOOGLE } from '../../lib/graphql/mutations';

import { GoogleAuthUrl as GoogleAuthUrlData } from '../../lib/graphql/queries/GoogleAuthUrl/__generated__/GoogleAuthUrl';
import {
  LogInWithGoogle as LogInWithGoogleData,
  LogInWithGoogleVariables,
} from '../../lib/graphql/mutations/LogInWithGoogle/__generated__/LogInWithGoogle';
import { Viewer } from '../../lib/types';

import { useScrollToTop } from '../../lib/hooks';
import {
  displaySuccessNotification,
  displayErrorMessage,
} from '../../lib/utils';

import googleLogo from './assets/google-logo.jpg';

import './styles/Login.css';

interface Props {
  setViewer: (viewer: Viewer) => void;
}

const { Content } = Layout;
const { Text, Title } = Typography;

export const Login = ({ setViewer }: Props): JSX.Element => {
  const history = useHistory();
  const client = useApolloClient();

  const [
    logInWithGoogle,
    { loading: logInLoading, error: logInError },
  ] = useMutation<LogInWithGoogleData, LogInWithGoogleVariables>(
    LOG_IN_WITH_GOOGLE,
    {
      onCompleted: (data) => {
        const { token, id: viewerId } = data.logInWithGoogle;

        sessionStorage.setItem('token', token as string);
        setViewer(data.logInWithGoogle);
        history.replace(`/user/${viewerId as string}`);
        displaySuccessNotification("You've successfully logged in!");
      },
    }
  );

  const logInRef = useRef(logInWithGoogle);

  useScrollToTop();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code');

    if (code) {
      void logInRef.current({
        variables: {
          input: { code },
        },
      });
    }
  }, []);

  const handleAuthorize = async () => {
    try {
      const { data } = await client.query<GoogleAuthUrlData>({
        query: GOOGLE_AUTH_URL,
      });

      window.location.href = data.googleAuthUrl;
    } catch {
      void displayErrorMessage(
        "Sorry! We weren't able to log you in. Please try again later!"
      );
    }
  };

  if (logInLoading) {
    return (
      <Content className="log-in">
        <Spin size="large" tip="Logging you in..." />
      </Content>
    );
  }

  const logInErrorBannerElement = logInError ? (
    <ErrorBanner description="Sorry! We weren't able to log you in. Please try again later!" />
  ) : null;

  return (
    <Content className="log-in">
      {logInErrorBannerElement}
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
        <button
          type="button"
          className="log-in-card__google-button"
          onClick={handleAuthorize}
        >
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
