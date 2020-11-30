import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    googleAuthUrl: String!
  }

  type Mutation {
    logInWithGoogle: String!
    logOut: String!
  }
`;
