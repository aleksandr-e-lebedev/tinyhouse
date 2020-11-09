import { IResolvers } from 'apollo-server-express';

import { Listing, listings } from '../listings';

export const resolvers: IResolvers = {
  Query: {
    listings: (): Listing[] => listings,
  },
  Mutation: {
    deleteListing: (_root: undefined, { id }: { id: string }): Listing => {
      const indexOfListing = listings.findIndex((listing) => listing.id === id);

      if (indexOfListing >= 0) {
        return listings.splice(indexOfListing, 1)[0];
      }

      throw new Error('Failed to delete listing');
    },
  },
};
