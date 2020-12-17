import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Viewer {
    id: ID
    token: String
    avatar: String
    hasWallet: Boolean
    didRequest: Boolean!
  }

  input LogInWithGoogleInput {
    code: String!
  }

  type Query {
    googleAuthUrl: String!
  }

  type Mutation {
    logInWithGoogle(input: LogInWithGoogleInput!): Viewer!
    logInWithCookie: Viewer!
    logOut: Viewer!
  }
`;
