import React from 'react';
import { render } from 'react-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import { Listings } from './sections';

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: '/api',
});

const App = () => <Listings title="TinyHouse Listings" />;

render(
  <ApolloProvider client={client}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ApolloProvider>,
  document.getElementById('root')
);
