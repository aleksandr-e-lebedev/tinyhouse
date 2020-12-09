import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { Layout } from 'antd';

import {
  Home,
  Host,
  Listing,
  Listings,
  Login,
  User,
  NotFound,
} from './sections';

import './styles/index.css';

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: '/api',
});

const App = () => {
  return (
    <Layout className="app">
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
          <Login />
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
