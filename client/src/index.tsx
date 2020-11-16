import React from 'react';
import { render } from 'react-dom';

import { Listings } from './sections';

const App = () => <Listings title="TinyHouse Listings" />;

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
