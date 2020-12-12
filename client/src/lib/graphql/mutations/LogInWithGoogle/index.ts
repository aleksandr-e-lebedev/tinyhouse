import { gql } from '@apollo/client';

export const LOG_IN_WITH_GOOGLE = gql`
  mutation LogInWithGoogle($input: LogInWithGoogleInput!) {
    logInWithGoogle(input: $input) {
      id
      token
      avatar
      hasWallet
      didRequest
    }
  }
`;
