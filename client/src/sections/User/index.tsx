import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Col, Layout, Row } from 'antd';

import { UserBookings, UserListings, UserProfile } from './components';
import { ErrorBanner, PageSkeleton } from '../../lib/components';

import { PAGE_LIMIT_4, PAGE_NUMBER_1 } from '../../lib/constants';
import { USER } from '../../lib/graphql/queries/User';

import {
  User as UserData,
  UserVariables,
} from '../../lib/graphql/queries/User/__generated__/User';
import { Viewer } from '../../lib/types';

import { useScrollToTop } from '../../lib/hooks';

import './styles/User.css';

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

interface MatchParams {
  id: string;
}

const { Content } = Layout;

export const User = ({ viewer, setViewer }: Props): JSX.Element => {
  const [listingsPage, setListingsPage] = useState(PAGE_NUMBER_1);
  const [bookingsPage, setBookingsPage] = useState(PAGE_NUMBER_1);

  const { id } = useParams<MatchParams>();

  const { loading, error, data, refetch } = useQuery<UserData, UserVariables>(
    USER,
    {
      variables: {
        id,
        limit: PAGE_LIMIT_4,
        bookingsPage,
        listingsPage,
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  useScrollToTop();

  const refetchUser = async () => {
    await refetch();
  };

  const stripeError = new URL(window.location.href).searchParams.get(
    'stripe_error'
  );

  const stripeErrorBanner = stripeError ? (
    <ErrorBanner description="We had an issue connecting with Stripe. Please try again soon." />
  ) : null;

  if (loading) {
    return (
      <Content className="user">
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="user">
        <ErrorBanner description="This user may not exist or we've encountered an error. Please try again soon." />
        <PageSkeleton />
      </Content>
    );
  }

  const user = data ? data.user : null;
  const viewerIsUser = viewer.id === user?.id;

  const userListings = user ? user.listings : null;
  const userBookings = user ? user.bookings : null;

  const userProfileElement = user ? (
    <UserProfile
      user={user}
      viewer={viewer}
      viewerIsUser={viewerIsUser}
      setViewer={setViewer}
      refetchUser={refetchUser}
    />
  ) : null;

  const userListingsElement = userListings ? (
    <UserListings
      userListings={userListings}
      limit={PAGE_LIMIT_4}
      listingsPage={listingsPage}
      setListingsPage={setListingsPage}
    />
  ) : null;

  const userBookingsElement = userBookings ? (
    <UserBookings
      userBookings={userBookings}
      limit={PAGE_LIMIT_4}
      bookingsPage={bookingsPage}
      setBookingsPage={setBookingsPage}
    />
  ) : null;

  return (
    <Content className="user">
      {stripeErrorBanner}
      <Row gutter={12} justify="space-between">
        <Col xs={24}>{userProfileElement}</Col>
        <Col xs={24}>
          <div>
            {userListingsElement}
            {userBookingsElement}
          </div>
        </Col>
      </Row>
    </Content>
  );
};
