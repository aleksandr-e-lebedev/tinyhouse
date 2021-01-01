import React from 'react';
import { Pagination } from 'antd';

import './styles/ListingsPagination.css';

interface Props {
  total: number;
  limit: number;
  page: number;
  setPage: (page: number) => void;
}

export const ListingsPagination = ({
  total,
  page,
  limit,
  setPage,
}: Props): JSX.Element => {
  return (
    <Pagination
      total={total}
      pageSize={limit}
      current={page}
      hideOnSinglePage
      showLessItems
      onChange={(selectedPage: number) => setPage(selectedPage)}
      className="listings-pagination"
    />
  );
};
