import React, { useState } from 'react';
import { render } from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { Affix, Layout } from 'antd';

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

  return (
    <Layout className="app">
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
