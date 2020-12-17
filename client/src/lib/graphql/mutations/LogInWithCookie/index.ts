import { gql } from '@apollo/client';

export const LOG_IN_WITH_COOKIE = gql`
  mutation LogInWithCookie {
    logInWithCookie {
      id
      token
      avatar
      hasWallet
      didRequest
    }
  }
`;
