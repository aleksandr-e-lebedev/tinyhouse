import { MongoClient } from 'mongodb';

import { Database } from '../lib/types';

const url = process.env.DB_URL as string;

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(url, { useUnifiedTopology: true });
  const db = client.db('main');

  return {
    listings: db.collection('test_listings'),
  };
};
