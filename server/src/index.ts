import express from 'express';

import { listings } from './listings';

const app = express();
const port = 9000;

app.get('/listings', (_req, res) => {
  res.send({
    status: 'success',
    data: { listings },
  });
});

app.listen(port, () => {
  console.log(`[app]: http://localhost:${port}`);
});
