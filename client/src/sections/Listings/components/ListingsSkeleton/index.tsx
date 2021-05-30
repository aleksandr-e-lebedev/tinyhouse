import React from 'react';
import { Card, List, Skeleton } from 'antd';

import './styles/ListingsSkeleton.css';

export const ListingsSkeleton = (): JSX.Element => {
  const emptyData = [{}, {}, {}, {}, {}, {}, {}, {}];

  return (
    <div className="listings-skeleton">
      <Skeleton paragraph={{ rows: 1 }} />
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
              cover={<div className="listings-skeleton__card-cover-img" />}
              loading
              className="listings-skeleton__card"
            />
          </List.Item>
        )}
      />
    </div>
  );
};
