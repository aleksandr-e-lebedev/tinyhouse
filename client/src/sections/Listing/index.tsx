import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Col, Layout, Row } from 'antd';

import { ListingBookings, ListingDetails } from './components';
import { ErrorBanner, PageSkeleton } from '../../lib/components';

import { PAGE_LIMIT_3, PAGE_NUMBER_1 } from '../../lib/constants';
import { LISTING } from '../../lib/graphql/queries';

import {
  Listing as ListingData,
  ListingVariables,
} from '../../lib/graphql/queries/Listing/__generated__/Listing';

import './styles/Listing.css';

interface MatchParams {
  id: string;
}

const { Content } = Layout;

export const Listing = (): JSX.Element => {
  const [bookingsPage, setBookingsPage] = useState(PAGE_NUMBER_1);

  const { id } = useParams<MatchParams>();

  const { loading, error, data } = useQuery<ListingData, ListingVariables>(
    LISTING,
    {
      variables: {
        id,
        limit: PAGE_LIMIT_3,
        page: bookingsPage,
      },
    }
  );

  if (loading) {
    return (
      <Content className="listings">
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner description="This listing may not exist or we've encountered an error. Please try again soon!" />
        <PageSkeleton />
      </Content>
    );
  }

  const listing = data ? data.listing : null;
  const listingBookings = listing ? listing.bookings : null;

  const listingDetailsElement = listing ? (
    <ListingDetails listing={listing} />
  ) : null;

  const listingBookingsElement = listingBookings ? (
    <ListingBookings
      listingBookings={listingBookings}
      limit={PAGE_LIMIT_3}
      bookingsPage={bookingsPage}
      setBookingsPage={setBookingsPage}
    />
  ) : null;

  return (
    <Content className="listings">
      <Row gutter={24} justify="space-between">
        <Col xs={24} lg={14}>
          {listingDetailsElement}
          {listingBookingsElement}
        </Col>
      </Row>
    </Content>
  );
};
