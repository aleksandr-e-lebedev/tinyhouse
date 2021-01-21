import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Affix, Layout, List, Typography } from 'antd';

import {
  ListingsFilters,
  ListingsPagination,
  ListingsSkeleton,
} from './components';
import { ErrorBanner, ListingCard } from '../../lib/components';

import { PAGE_LIMIT_8, PAGE_NUMBER_1 } from '../../lib/constants';
import { LISTINGS } from '../../lib/graphql/queries';

import {
  Listings as ListingsData,
  ListingsVariables,
} from '../../lib/graphql/queries/Listings/__generated__/Listings';
import { ListingsFilter } from '../../lib/graphql/globalTypes';

import { useScrollToTop } from '../../lib/hooks';

import './styles/Listings.css';

interface MatchParams {
  location: string;
}

const { Content } = Layout;
const { Paragraph, Text, Title } = Typography;

export const Listings = (): JSX.Element => {
  const { location } = useParams<MatchParams>();
  const locationRef = useRef(location);

  const [filter, setFilter] = useState(ListingsFilter.PRICE_LOW_TO_HIGH);
  const [page, setPage] = useState(PAGE_NUMBER_1);

  const { loading, error, data } = useQuery<ListingsData, ListingsVariables>(
    LISTINGS,
    {
      skip: locationRef.current !== location && page !== PAGE_NUMBER_1,
      variables: {
        location,
        filter,
        limit: PAGE_LIMIT_8,
        page,
      },
    }
  );

  useScrollToTop();

  useEffect(() => {
    locationRef.current = location;
    setPage(PAGE_NUMBER_1);
  }, [location]);

  if (loading) {
    return (
      <Content className="listings">
        <ListingsSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner description="We either couldn't find anything matching your search or have encountered an error. If you're searching for a unique location, try searching again with more common keywords." />
        <ListingsSkeleton />
      </Content>
    );
  }

  const listings = data ? data.listings : null;
  const listingsRegion = listings ? listings.region : null;

  const listingsSectionElement = listings?.result.length ? (
    <div>
      <Affix offsetTop={64}>
        <ListingsPagination
          total={listings.total}
          limit={PAGE_LIMIT_8}
          page={page}
          setPage={setPage}
        />
        <ListingsFilters filter={filter} setFilter={setFilter} />
      </Affix>
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
        dataSource={listings.result}
        renderItem={(listing) => (
          <List.Item>
            <ListingCard listing={listing} />
          </List.Item>
        )}
      />
    </div>
  ) : (
    <div>
      <Paragraph>
        It appears that no listings have yet been created for{' '}
        <Text mark>&quot;{listingsRegion}&quot;</Text>
      </Paragraph>
      <Paragraph>
        Be the first person to create a{' '}
        <Link to="/host">listing in this area</Link>!
      </Paragraph>
    </div>
  );

  const listingsRegionElement = listingsRegion ? (
    <Title level={3} className="listings__title">
      Results for &quot;{listingsRegion}&quot;
    </Title>
  ) : null;

  return (
    <Content className="listings">
      {listingsRegionElement}
      {listingsSectionElement}
    </Content>
  );
};
