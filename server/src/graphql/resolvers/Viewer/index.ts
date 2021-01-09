import crypto from 'crypto';
import { promisify } from 'util';
import { Request, Response } from 'express';
import { IResolvers } from 'apollo-server-express';
import { people_v1 } from 'googleapis';

import { Google, Stripe } from '../../../lib/api';

import {
  LogInWithGoogleArgs,
  ConnectStripeArgs,
  GoogleUserDetails,
} from './types';
import { Viewer, Database } from '../../../lib/types';

import { authorize } from '../../../lib/utils';

const cookieOptions = {
  httpOnly: true,
  sameSite: true,
  signed: true,
  secure: process.env.NODE_ENV === 'development' ? false : true,
};

const cookieDuration = process.env.COOKIE_DURATION || 7 * 24 * 60 * 60 * 1000; // 7 days

const getGoogleUserDetails = (
  user: people_v1.Schema$Person
): GoogleUserDetails => {
  const userNamesList = user.names?.length ? user.names : null;
  const userPhotosList = user.photos?.length ? user.photos : null;
  const userEmailsList = user.emailAddresses?.length
    ? user.emailAddresses
    : null;

  const id = userNamesList?.[0]?.metadata?.source?.id
    ? userNamesList[0].metadata.source.id
    : null;

  const name = userNamesList?.[0]?.displayName
    ? userNamesList[0].displayName
    : null;

  const avatar = userPhotosList?.[0]?.url ? userPhotosList[0].url : null;

  const email = userEmailsList?.[0]?.value ? userEmailsList[0].value : null;

  if (!id || !name || !avatar || !email) {
    throw new Error('Google login error');
  }

  return { id, name, avatar, email };
};

const createXCsrfToken = async (): Promise<string> => {
  const buf = await promisify(crypto.randomBytes)(16);
  const token = buf.toString('hex');

  return token;
};

export const viewerResolvers: IResolvers = {
  Query: {
    googleAuthUrl: (): string => {
      try {
        return Google.authUrl;
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Failed to query Google Auth URL': ${error}`);
      }
    },
    stripeAuthUrl: async (
      _root: undefined,
      _args: Record<string, unknown>,
      { db, req, res }: { db: Database; req: Request; res: Response }
    ): Promise<string> => {
      try {
        const viewer = await authorize(db, req, res);

        if (!viewer) {
          throw new Error('Viewer cannot be found');
        }

        if (viewer.walletId) {
          throw new Error("Viewer's Stripe account has already been connected");
        }

        const authUrl = Stripe.getAuthUrl();

        return authUrl;
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Failed to retrieve Stripe OAuth link URL: ${error}`);
      }
    },
  },
  Mutation: {
    logInWithGoogle: async (
      _root: undefined,
      { input }: LogInWithGoogleArgs,
      { db, res }: { db: Database; res: Response }
    ): Promise<Viewer> => {
      try {
        const { user } = await Google.logIn(input.code);

        if (!user) {
          throw new Error('Google login error');
        }

        const { id, name, avatar, email } = getGoogleUserDetails(user);
        const token = await createXCsrfToken();

        const updateResult = await db.users.findOneAndUpdate(
          { _id: id },
          {
            $set: {
              token,
              name,
              avatar,
              contact: email,
            },
          },
          { returnOriginal: false }
        );

        let viewer = updateResult.value;

        if (!viewer) {
          const insertResult = await db.users.insertOne({
            _id: id,
            token,
            name,
            avatar,
            contact: email,
            income: 0,
            bookings: [],
            listings: [],
          });

          viewer = insertResult.ops[0];
        }

        if (!viewer) {
          return { didRequest: true };
        }

        res.cookie('viewer', id, {
          ...cookieOptions,
          maxAge: cookieDuration as number,
        });

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Failed to log in: ${error}`);
      }
    },
    logInWithCookie: async (
      _root: undefined,
      _args: Record<string, unknown>,
      { db, req, res }: { db: Database; req: Request; res: Response }
    ): Promise<Viewer> => {
      try {
        const { viewer: userId } = req.signedCookies as Record<
          string,
          string | false | undefined
        >;

        if (!userId) {
          res.clearCookie('viewer', cookieOptions);
          return { didRequest: true };
        }

        const token = await createXCsrfToken();

        const updateResult = await db.users.findOneAndUpdate(
          { _id: userId },
          { $set: { token } },
          { returnOriginal: false }
        );

        const viewer = updateResult.value;

        if (!viewer) {
          res.clearCookie('viewer', cookieOptions);
          return { didRequest: true };
        }

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Failed to log in: ${error}`);
      }
    },
    logOut: (
      _root: undefined,
      _args: Record<string, unknown>,
      { res }: { res: Response }
    ): Viewer => {
      try {
        res.clearCookie('viewer', cookieOptions);
        return { didRequest: true };
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Failed to log out: ${error}`);
      }
    },
    connectStripe: async (
      _root: undefined,
      { input }: ConnectStripeArgs,
      { db, req, res }: { db: Database; req: Request; res: Response }
    ): Promise<Viewer> => {
      try {
        let viewer = await authorize(db, req, res);

        if (!viewer) {
          throw new Error('Viewer cannot be found');
        }

        if (viewer.walletId) {
          throw new Error("Viewer's Stripe account has already been connected");
        }

        const response = await Stripe.connect(input.code);

        if (!response || !response.stripe_user_id) {
          throw new Error('Stripe grant error');
        }

        const updateResult = await db.users.findOneAndUpdate(
          { _id: viewer._id },
          { $set: { walletId: response.stripe_user_id } },
          { returnOriginal: false }
        );

        const updatedViewer = updateResult.value;

        if (!updatedViewer) {
          throw new Error('Viewer could not be updated');
        }

        viewer = updatedViewer;

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Failed to connect with Stripe: ${error}`);
      }
    },
    disconnectStripe: async (
      _root: undefined,
      _args: Record<string, unknown>,
      { db, req, res }: { db: Database; req: Request; res: Response }
    ): Promise<Viewer> => {
      try {
        let viewer = await authorize(db, req, res);

        if (!viewer) {
          throw new Error('Viewer cannot be found');
        }

        if (!viewer.walletId) {
          throw new Error('Stripe account has not been created yet');
        }

        const response = await Stripe.disconnect(viewer.walletId);

        if (
          !response ||
          !response.stripe_user_id ||
          response.stripe_user_id !== viewer.walletId
        ) {
          throw new Error('Stripe disconnect error');
        }

        const updateResult = await db.users.findOneAndUpdate(
          { _id: viewer._id },
          { $set: { walletId: null } },
          { returnOriginal: false }
        );

        const updatedViewer = updateResult.value;

        if (!updatedViewer) {
          throw new Error('Viewer could not be updated');
        }

        viewer = updatedViewer;

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Failed to disconnect from Stripe: ${error}`);
      }
    },
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => {
      return viewer._id;
    },
    hasWallet: (viewer: Viewer): boolean => {
      return !!viewer.walletId;
    },
  },
};
