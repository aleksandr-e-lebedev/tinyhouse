import { IResolvers } from 'apollo-server-express';

import { Database, Booking, Listing, User } from '../../../lib/types';

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
    tenant: async (
      booking: Booking,
      _args: Record<string, unknown>,
      { db }: { db: Database }
    ): Promise<User> => {
      try {
        const tenant = await db.users.findOne({ _id: booking.tenant });

        if (!tenant) {
          throw new Error("Tenant can't be found");
        }

        return tenant;
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Failed to query booking tenant: ${error}`);
      }
    },
  },
};
