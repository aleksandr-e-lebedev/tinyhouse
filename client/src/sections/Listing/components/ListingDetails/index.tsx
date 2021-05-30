import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Divider, Tag, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

import { ANTD_ICON_COLOR } from '../../../../lib/constants';
import { Listing as ListingData } from '../../../../lib/graphql/queries/Listing/__generated__/Listing';

import './styles/ListingDetails.css';

interface Props {
  listing: ListingData['listing'];
}

const { Paragraph, Title } = Typography;

export const ListingDetails = ({ listing }: Props): JSX.Element => {
  return (
    <div className="listing-details">
      <div
        style={{ backgroundImage: `url(${listing.image})` }}
        className="listing-details__image"
      />

      <div className="listing-details__information">
        <Paragraph
          type="secondary"
          ellipsis
          className="listing-details__city-address"
        >
          <Link to={`/listings/${listing.city}`}>
            <EnvironmentOutlined style={{ color: ANTD_ICON_COLOR }} />{' '}
            {listing.city}
          </Link>
          <Divider type="vertical" />
          {listing.address}
        </Paragraph>
        <Title level={3} className="listing-details__title">
          {listing.title}
        </Title>
      </div>

      <Divider />

      <div className="listing-details__section">
        <Link to={`/user/${listing.host.id}`}>
          <Avatar src={listing.host.avatar} size={64} />
          <Title level={2} className="listing-details__host-name">
            {listing.host.name}
          </Title>
        </Link>
      </div>

      <Divider />

      <div className="listing-details__section">
        <Title level={4}>About this space</Title>
        <div className="listing-details__about-items">
          <Tag color="magenta">{listing.type}</Tag>
          <Tag color="magenta">{listing.numOfGuests} Guests</Tag>
        </div>
        <Paragraph ellipsis={{ rows: 3, expandable: true }}>
          {listing.description}
        </Paragraph>
      </div>
    </div>
  );
};
