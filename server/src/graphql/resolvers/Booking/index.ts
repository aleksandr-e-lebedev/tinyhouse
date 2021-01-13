import { IResolvers } from 'apollo-server-express';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import dayjs from 'dayjs';

import { Stripe } from '../../../lib/api';
import { ONE_DAY, NINETY_DAYS } from '../../../lib/constants';

import { CreateBookingArgs } from './types';
import {
  Database,
  Booking,
  Listing,
  User,
  BookingsIndex,
} from '../../../lib/types';

import { authorize } from '../../../lib/utils';

const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkIn: string,
  checkOut: string
): BookingsIndex => {
  const checkOutDate = dayjs(checkOut);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  let dateCursor = dayjs(checkIn);

  while (dateCursor <= checkOutDate) {
    const year = dateCursor.year();
    const month = dateCursor.month();
    const day = dateCursor.date();

    if (!newBookingsIndex[year]) {
      newBookingsIndex[year] = {};
    }

    if (!newBookingsIndex[year][month]) {
      newBookingsIndex[year][month] = {};
    }

    if (!newBookingsIndex[year][month][day]) {
      newBookingsIndex[year][month][day] = true;
    } else {
      throw new Error(
        "Selected dates can't overlap dates that have already been booked"
      );
    }

    dateCursor = dateCursor.add(1, 'day');
  }

  return newBookingsIndex;
};

const countBookingPrice = (
  listingPrice: number,
  checkIn: string,
  checkOut: string
): number => {
  const checkInDate = dayjs(checkIn);
  const checkOutDate = dayjs(checkOut);
  const daysBooked = checkOutDate.diff(checkInDate, 'days') + ONE_DAY;
  const bookingPrice = listingPrice * daysBooked;

  return bookingPrice;
};

export const bookingResolvers: IResolvers = {
  Mutation: {
    createBooking: async (
      _root: undefined,
      { input }: CreateBookingArgs,
      { db, req, res }: { db: Database; req: Request; res: Response }
    ): Promise<Booking> => {
      try {
        const viewer = await authorize(db, req, res);

        if (!viewer) {
          throw new Error('Viewer cannot be found');
        }

        const { listingId, source, checkIn, checkOut } = input;

        const listing = await db.listings.findOne({
          _id: new ObjectId(listingId),
        });

        if (!listing) {
          throw new Error("Listing can't be found");
        }

        if (viewer._id === listing.host) {
          throw new Error("Viewer can't book own listing");
        }

        const host = await db.users.findOne({
          _id: listing.host,
        });

        if (!host || !host.walletId) {
          throw new Error(
            "The host either can't be found or is not connected with Stripe"
          );
        }

        const today = dayjs();
        const checkInDate = dayjs(checkIn);
        const checkOutDate = dayjs(checkOut);

        if (checkInDate.diff(today, 'days') >= NINETY_DAYS) {
          throw new Error(
            "Check in date can't be more than 90 days from today"
          );
        }

        if (checkOutDate.diff(today, 'days') >= NINETY_DAYS) {
          throw new Error(
            "Check out date can't be more than 90 days from today"
          );
        }

        if (checkOutDate < checkInDate) {
          throw new Error("Check out date can't be before check in date");
        }

        const bookingsIndex = resolveBookingsIndex(
          listing.bookingsIndex,
          checkIn,
          checkOut
        );

        const bookingPrice = countBookingPrice(
          listing.price,
          checkIn,
          checkOut
        );

        const response = await Stripe.createCharge(
          bookingPrice,
          source,
          host.walletId
        );

        if (response.status !== 'succeeded') {
          throw new Error('Failed to create charge with Stripe');
        }

        const insertResult = await db.bookings.insertOne({
          _id: new ObjectId(),
          listing: listing._id,
          tenant: viewer._id,
          checkIn,
          checkOut,
        });

        const insertedBooking: Booking = insertResult.ops[0];

        await db.users.updateOne(
          { _id: host._id },
          { $inc: { income: bookingPrice } }
        );

        await db.users.updateOne(
          { _id: viewer._id },
          { $push: { bookings: insertedBooking._id } }
        );

        await db.listings.updateOne(
          { _id: listing._id },
          {
            $set: { bookingsIndex },
            $push: { bookings: insertedBooking._id },
          }
        );

        return insertedBooking;
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Failed to create a booking: ${error}`);
      }
    },
  },
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
