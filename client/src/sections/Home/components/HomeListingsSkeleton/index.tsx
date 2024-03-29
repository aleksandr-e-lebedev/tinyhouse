import React from 'react';
import { Card, List, Skeleton } from 'antd';

import './styles/HomeListingsSkeleton.css';

export const HomeListingsSkeleton = (): JSX.Element => {
  const emptyData = [{}, {}, {}, {}];

  return (
    <div className="home-listings-skeleton">
      <Skeleton paragraph={{ rows: 0 }} />
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
        dataSource={emptyData}
        renderItem={() => (
          <List.Item>
            <Card
              cover={<div className="home-listings-skeleton__card-cover-img" />}
              loading
            />
          </List.Item>
        )}
      />
    </div>
  );
};
