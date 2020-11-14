import React from 'react';
import { render } from 'react-dom';

const App = () => <div>Hello World!</div>;

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
