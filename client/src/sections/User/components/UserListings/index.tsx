import React from 'react';
import { List, Typography } from 'antd';

import { ListingCard } from '../../../../lib/components';
import { User } from '../../../../lib/graphql/queries/User/__generated__/User';

import './styles/UserListings.css';

interface Props {
  userListings: User['user']['listings'];
  limit: number;
  listingsPage: number;
  setListingsPage: (page: number) => void;
}

const { Paragraph, Title } = Typography;

export const UserListings = ({
  userListings,
  limit,
  listingsPage,
  setListingsPage,
}: Props): JSX.Element => {
  const { total, result } = userListings;

  const userListingsList = (
    <List
      grid={{ gutter: 8, xs: 1, sm: 2, md: 2, lg: 4, xl: 4, xxl: 4 }}
      dataSource={result}
      locale={{ emptyText: "User doesn't have any listings yet!" }}
      pagination={{
        position: 'top',
        total,
        pageSize: limit,
        current: listingsPage,
        hideOnSinglePage: true,
        showLessItems: true,
        onChange: (page: number) => setListingsPage(page),
      }}
      renderItem={(userListing) => (
        <List.Item>
          <ListingCard listing={userListing} />
        </List.Item>
      )}
    />
  );

  return (
    <div className="user-listings">
      <Title level={4} className="user-listings__title">
        Listings
      </Title>
      <Paragraph className="user-listings__description">
        This section highlights the listings this user currently hosts and has
        made available for bookings.
      </Paragraph>
      {userListingsList}
    </div>
  );
};
