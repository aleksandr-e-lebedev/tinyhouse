import { MongoClient } from 'mongodb';

import { Database, Booking, Listing, User } from '../lib/types';

const url = process.env.DB_URL as string;

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(url, { useUnifiedTopology: true });
  const db = client.db('main');

  return {
    bookings: db.collection<Booking>('bookings'),
    listings: db.collection<Listing>('listings'),
    users: db.collection<User>('users'),
  };
};
