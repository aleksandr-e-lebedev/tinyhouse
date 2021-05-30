import React, { useEffect } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Layout, Spin } from 'antd';

import { CONNECT_STRIPE } from '../../lib/graphql/mutations';

import {
  ConnectStripe as ConnectStripeData,
  ConnectStripeVariables,
} from '../../lib/graphql/mutations/ConnectStripe/__generated__/ConnectStripe';
import { Viewer } from '../../lib/types';

import { displaySuccessNotification } from '../../lib/utils';

import './styles/Stripe.css';

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Content } = Layout;

export const Stripe = ({ viewer, setViewer }: Props): JSX.Element | null => {
  const history = useHistory();

  const [connectStripe, { loading, error }] = useMutation<
    ConnectStripeData,
    ConnectStripeVariables
  >(CONNECT_STRIPE, {
    onCompleted: (data) => {
      const { hasWallet } = data.connectStripe;

      setViewer({ ...viewer, hasWallet });
      history.replace(`/user/${viewer.id as string}`);
      displaySuccessNotification(
        "You've successfully connected your Stripe Account!",
        'You can now begin to create listings in the Host page.'
      );
    },
  });

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code');

    if (code) {
      void connectStripe({
        variables: {
          input: { code },
        },
      });
    } else {
      history.replace('/login');
    }
  }, [connectStripe, history]);

  if (loading) {
    return (
      <Content className="stripe">
        <Spin size="large" tip="Connecting your Stripe account..." />
      </Content>
    );
  }

  if (error) {
    return <Redirect to={`/user/${viewer.id as string}?stripe_error=true`} />;
  }

  return null;
};
