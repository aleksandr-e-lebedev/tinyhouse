import React from 'react';
import { useApolloClient } from '@apollo/client';
import { Avatar, Button, Card, Divider, Tag, Typography } from 'antd';

import { STRIPE_AUTH_URL } from '../../../../lib/graphql/queries';

import { StripeAuthUrl as StripeAuthUrlData } from '../../../../lib/graphql/queries/StripeAuthUrl/__generated__/StripeAuthUrl';
import { User as UserData } from '../../../../lib/graphql/queries/User/__generated__/User';

import {
  formatListingPrice as formatUserIncome,
  displayErrorMessage,
} from '../../../../lib/utils';

import './styles/UserProfile.css';

interface Props {
  user: UserData['user'];
  viewerIsUser: boolean;
}

const { Paragraph, Text, Title } = Typography;

export const UserProfile = ({ user, viewerIsUser }: Props): JSX.Element => {
  const client = useApolloClient();

  const handleConnectWithStripe = async () => {
    try {
      const { data } = await client.query<StripeAuthUrlData>({
        query: STRIPE_AUTH_URL,
      });

      window.location.href = data.stripeAuthUrl;
    } catch {
      void displayErrorMessage(
        "Sorry! We weren't able to connect you with Stripe. Please try again later!"
      );
    }
  };

  const additionalDetails = user.hasWallet ? (
    <>
      <Paragraph>
        <Tag color="green">Stripe Registered</Tag>
      </Paragraph>
      <Paragraph>
        Income Earned:{' '}
        <Text strong>{user.income ? formatUserIncome(user.income) : `$0`}</Text>
      </Paragraph>
    </>
  ) : (
    <>
      <Paragraph>
        Interested in becoming a TinyHouse host? Register with your Stripe
        account!
      </Paragraph>
      <Button
        type="primary"
        className="user-profile__details-cta"
        onClick={handleConnectWithStripe}
      >
        Connect with Stripe
      </Button>
      <Paragraph type="secondary">
        TinyHouse uses{' '}
        <a
          href="https://stripe.com/en-US/connect"
          target="_blank"
          rel="noopener noreferrer"
        >
          Stripe
        </a>{' '}
        to help transfer your earnings in a secure and truster manner.
      </Paragraph>
    </>
  );

  const additionalDetailsSection = viewerIsUser ? (
    <>
      <Divider />
      <div className="user-profile__details">
        <Title level={4}>Additional Details</Title>
        {additionalDetails}
      </div>
    </>
  ) : null;

  return (
    <div className="user-profile">
      <Card className="user-profile__card">
        <div className="user-profile__avatar">
          <Avatar size={100} src={user.avatar} />
        </div>
        <Divider />
        <div className="user-profile__details">
          <Title level={4}>Details</Title>
          <Paragraph>
            Name: <Text strong>{user.name}</Text>
          </Paragraph>
          <Paragraph>
            Contact: <Text strong>{user.contact}</Text>
          </Paragraph>
        </div>
        {additionalDetailsSection}
      </Card>
    </div>
  );
};
