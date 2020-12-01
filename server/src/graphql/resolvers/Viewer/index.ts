import crypto from 'crypto';
import { promisify } from 'util';
import { IResolvers } from 'apollo-server-express';
import { people_v1 } from 'googleapis';

import { Google } from '../../../lib/api';

import { LogInWithGoogleArgs, GoogleUserDetails } from './types';
import { Viewer, Database } from '../../../lib/types';

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
  },
  Mutation: {
    logInWithGoogle: async (
      _root: undefined,
      { input }: LogInWithGoogleArgs,
      { db }: { db: Database }
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
    logOut: (): Viewer => {
      try {
        return { didRequest: true };
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Failed to log out: ${error}`);
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
