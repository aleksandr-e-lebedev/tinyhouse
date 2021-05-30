import { URLSearchParams } from 'url';
import stripe from 'stripe';

import { PUBLIC_URL, STRIPE_CLIENT_ID, STRIPE_API_SECRET } from '../../config';

const client = new stripe(STRIPE_API_SECRET as string, {
  apiVersion: '2020-08-27',
  typescript: true,
});

export const Stripe = {
  getAuthUrl: (): string => {
    const args = new URLSearchParams({
      response_type: 'code',
      client_id: STRIPE_CLIENT_ID,
      scope: 'read_write',
      redirect_uri: `${PUBLIC_URL}/stripe`,
    });

    const authUrl = `https://connect.stripe.com/oauth/authorize?${args.toString()}`;

    return authUrl;
  },
  connect: async (code: string): Promise<stripe.OAuthToken> => {
    const response = await client.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    return response;
  },
  disconnect: async (
    stripeUserId: string
  ): Promise<stripe.OAuthDeauthorization> => {
    const response = await client.oauth.deauthorize({
      client_id: `${process.env.STRIPE_CLIENT_ID as string}`,
      stripe_user_id: stripeUserId,
    });

    return response;
  },
  createCharge: async (
    amount: number,
    source: string,
    stripeAccount: string
  ): Promise<stripe.Response<stripe.Charge>> => {
    const response = await client.charges.create(
      {
        amount,
        currency: 'usd',
        source,
        application_fee_amount: Math.round(amount * 0.05),
      },
      { stripeAccount }
    );

    return response;
  },
};
