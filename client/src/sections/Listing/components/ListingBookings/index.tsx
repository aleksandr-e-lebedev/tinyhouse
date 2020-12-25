import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Divider, List, Typography } from 'antd';

import { Listing } from '../../../../lib/graphql/queries/Listing/__generated__/Listing';

import './styles/ListingBookings.css';

interface Props {
  listingBookings: Listing['listing']['bookings'];
  limit: number;
  bookingsPage: number;
  setBookingsPage: (page: number) => void;
}

const { Text, Title } = Typography;

export const ListingBookings = ({
  listingBookings,
  limit,
  bookingsPage,
  setBookingsPage,
}: Props): JSX.Element | null => {
  const total = listingBookings ? listingBookings.total : null;
  const result = listingBookings ? listingBookings.result : null;

  const listingBookingsList = listingBookings ? (
    <List
      grid={{
        gutter: 8,
        xs: 1,
        sm: 2,
        md: 2,
        lg: 3,
        xl: 3,
        xxl: 3,
      }}
      dataSource={result || undefined}
      locale={{ emptyText: 'No bookings have been made yet!' }}
      pagination={{
        total: total || undefined,
        pageSize: limit,
        current: bookingsPage,
        hideOnSinglePage: true,
        showLessItems: true,
        onChange: (page: number) => setBookingsPage(page),
      }}
      renderItem={(listingBooking) => {
        const bookingHistory = (
          <div className="listing-bookings__history">
            <div>
              Check in: <Text strong>{listingBooking.checkIn}</Text>
            </div>
            <div>
              Check out: <Text strong>{listingBooking.checkOut}</Text>
            </div>
          </div>
        );

        return (
          <List.Item className="listing-bookings__item">
            {bookingHistory}
            <Link to={`/user/${listingBooking.tenant.id}`}>
              <Avatar
                src={listingBooking.tenant.avatar}
                size={64}
                shape="square"
              />
            </Link>
          </List.Item>
        );
      }}
    />
  ) : null;

  const listingBookingsElement = listingBookingsList ? (
    <div className="listing-bookings">
      <Divider />
      <div className="listing-bookings__section">
        <Title level={4}>Bookings</Title>
      </div>
      {listingBookingsList}
    </div>
  ) : null;

  return listingBookingsElement;
};
