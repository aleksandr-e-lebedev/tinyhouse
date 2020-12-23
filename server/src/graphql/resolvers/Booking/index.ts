import { IResolvers } from 'apollo-server-express';

import { Database, Booking, Listing } from '../../../lib/types';

export const bookingResolvers: IResolvers = {
  Booking: {
    id: (booking: Booking): string => {
      return booking._id.toString();
    },
    listing: async (
      booking: Booking,
      _args: Record<string, unknown>,
      { db }: { db: Database }
    ): Promise<Listing> => {
      try {
        const listing = await db.listings.findOne({ _id: booking.listing });

        if (!listing) {
          throw new Error("Booking listing can't be found");
        }

        return listing;
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Failed to query booking listing: ${error}`);
      }
    },
  },
};
