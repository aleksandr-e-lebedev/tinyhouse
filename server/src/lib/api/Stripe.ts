import { URLSearchParams } from 'url';
import stripe from 'stripe';

const client = new stripe(process.env.STRIPE_API_SECRET as string, {
  apiVersion: '2020-08-27',
  typescript: true,
});

export const Stripe = {
  getAuthUrl: (): string => {
    const args = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.STRIPE_CLIENT_ID,
      scope: 'read_write',
      redirect_uri: `${process.env.PUBLIC_URL as string}/stripe`,
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
};
