import { IResolvers } from 'apollo-server-express';

export const viewerResolvers: IResolvers = {
  Query: {
    googleAuthUrl: (): string => {
      return 'Query.googleAuthUrl';
    },
  },
  Mutation: {
    logInWithGoogle: (): string => {
      return 'Mutation.logInWithGoogle';
    },
    logOut: (): string => {
      return 'Mutation.logOut';
    },
  },
};
