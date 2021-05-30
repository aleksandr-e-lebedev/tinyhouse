import React from 'react';
import { List, Typography } from 'antd';

import { ListingCard } from '../../../../lib/components';
import { User } from '../../../../lib/graphql/queries/User/__generated__/User';

import './styles/UserBookings.css';

interface Props {
  userBookings: User['user']['bookings'];
  limit: number;
  bookingsPage: number;
  setBookingsPage: (page: number) => void;
}

const { Paragraph, Text, Title } = Typography;

export const UserBookings = ({
  userBookings,
  limit,
  bookingsPage,
  setBookingsPage,
}: Props): JSX.Element | null => {
  const total = userBookings ? userBookings.total : null;
  const result = userBookings ? userBookings.result : null;

  const userBookingsList = userBookings ? (
    <List
      grid={{
        gutter: 8,
        xs: 1,
        sm: 2,
        md: 2,
        lg: 4,
        xl: 4,
        xxl: 4,
      }}
      dataSource={result || undefined}
      locale={{ emptyText: "You haven't made any bookings!" }}
      pagination={{
        position: 'top',
        total: total || undefined,
        pageSize: limit,
        current: bookingsPage,
        hideOnSinglePage: true,
        showLessItems: true,
        onChange: (page: number) => setBookingsPage(page),
      }}
      renderItem={(userBooking) => {
        const bookingHistory = (
          <div className="user-bookings__booking-history">
            <div>
              Check in: <Text strong>{userBooking.checkIn}</Text>
            </div>
            <div>
              Check out: <Text strong>{userBooking.checkOut}</Text>
            </div>
          </div>
        );

        return (
          <List.Item>
            {bookingHistory}
            <ListingCard listing={userBooking.listing} />
          </List.Item>
        );
      }}
    />
  ) : null;

  const userBookingsElement = userBookingsList ? (
    <div className="user-bookings">
      <Title level={4} className="user-bookings__title">
        Bookings
      </Title>
      <Paragraph className="user-bookings__description">
        This section highlights the bookings you&apos;ve made, and the
        check-in/check-out dates associated with said bookings.
      </Paragraph>
      {userBookingsList}
    </div>
  ) : null;

  return userBookingsElement;
};
