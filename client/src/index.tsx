import React, { useState, useEffect, useRef } from 'react';
import { render } from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useMutation,
} from '@apollo/client';
import { Affix, Spin, Layout } from 'antd';

import {
  AppHeader,
  Home,
  Host,
  Listing,
  Listings,
  Login,
  User,
  NotFound,
} from './sections';

import { AppHeaderSkeleton, ErrorBanner } from './lib/components';

import { LOG_IN_WITH_COOKIE } from './lib/graphql/mutations';

import { LogInWithCookie as LogInWithCookieData } from './lib/graphql/mutations/LogInWithCookie/__generated__/LogInWithCookie';
import { Viewer } from './lib/types';

import './styles/index.css';

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: '/api',
});

const initialViewer: Viewer = {
  id: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false,
};

const App = () => {
  const [viewer, setViewer] = useState<Viewer>(initialViewer);

  const [logInWithCookie, { error: logInError }] = useMutation<
    LogInWithCookieData
  >(LOG_IN_WITH_COOKIE, {
    onCompleted: (data) => {
      setViewer(data.logInWithCookie);
    },
  });

  const logInRef = useRef(logInWithCookie);

  useEffect(() => {
    void logInRef.current();
  }, []);

  if (!viewer.didRequest && !logInError) {
    return (
      <Layout className="app-skeleton">
        <AppHeaderSkeleton />
        <div className="app-skeleton__spin-section">
          <Spin size="large" tip="Launching TinyHouse" />
        </div>
      </Layout>
    );
  }

  const logInErrorBannerElement = logInError ? (
    <ErrorBanner description="We weren't able to verify if you were logged in. Please try again later!" />
  ) : null;

  return (
    <Layout className="app">
      {logInErrorBannerElement}
      <Affix offsetTop={0} className="app__affix-header">
        <AppHeader viewer={viewer} setViewer={setViewer} />
      </Affix>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/host">
          <Host />
        </Route>
        <Route exact path="/listing/:id">
          <Listing />
        </Route>
        <Route exact path="/listings/:location?">
          <Listings />
        </Route>
        <Route exact path="/login">
          {viewer.id ? (
            <Redirect to={`/user/${viewer.id}`} />
          ) : (
            <Login setViewer={setViewer} />
          )}
        </Route>
        <Route exact path="/user/:id">
          <User />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </Layout>
  );
};

render(
  <ApolloProvider client={client}>
    <Router>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Router>
  </ApolloProvider>,
  document.getElementById('root')
);
