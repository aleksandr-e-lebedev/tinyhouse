import { gql } from '@apollo/client';

export const STRIPE_AUTH_URL = gql`
  query StripeAuthUrl {
    stripeAuthUrl
  }
`;
