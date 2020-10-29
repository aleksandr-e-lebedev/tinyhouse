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

app.delete('/listings/:listingId', (req, res) => {
  const { listingId } = req.params;

  const indexOfListing = listings.findIndex(
    (listing) => listing.id === listingId
  );

  if (indexOfListing >= 0) {
    listings.splice(indexOfListing, 1);

    return res.send({
      status: 'success',
      message: 'The listing has been removed',
    });
  }

  res.status(404).send({
    status: 'fail',
    message: 'Sorry, cant find that listing',
  });
});

app.listen(port, () => {
  console.log(`[app]: http://localhost:${port}`);
});
