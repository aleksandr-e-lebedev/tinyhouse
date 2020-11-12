import { IResolvers } from 'apollo-server-express';
import { ObjectId } from 'mongodb';

import { Database, Listing } from '../lib/types';

export const resolvers: IResolvers = {
  Query: {
    listings: (
      _root: undefined,
      _args: Record<string, unknown>,
      { db }: { db: Database }
    ): Promise<Listing[]> => db.listings.find({}).toArray(),
  },
  Mutation: {
    deleteListing: async (
      _root: undefined,
      { id }: { id: string },
      { db }: { db: Database }
    ): Promise<Listing> => {
      const deleteRes = await db.listings.findOneAndDelete({
        _id: new ObjectId(id),
      });

      if (!deleteRes.value) throw new Error('Failed to delete listing');

      return deleteRes.value;
    },
  },
  Listing: {
    id: (listing: Listing): string => listing._id.toString(),
  },
};
