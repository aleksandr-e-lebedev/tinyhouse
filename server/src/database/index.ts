import { MongoClient } from 'mongodb';

import { DB_URL } from '../config';
import { Database, Booking, Listing, User } from '../lib/types';

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(DB_URL, {
    useUnifiedTopology: true,
  });

  const db = client.db('main');

  return {
    bookings: db.collection<Booking>('bookings'),
    listings: db.collection<Listing>('listings'),
    users: db.collection<User>('users'),
  };
};
