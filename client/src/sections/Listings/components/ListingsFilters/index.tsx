import React from 'react';
import { Select } from 'antd';

import { ListingsFilter } from '../../../../lib/graphql/globalTypes';

import './styles/ListingsFilters.css';

interface Props {
  filter: ListingsFilter;
  setFilter: (filter: ListingsFilter) => void;
}

const { Option } = Select;

export const ListingsFilters = ({ filter, setFilter }: Props): JSX.Element => {
  return (
    <div className="listings-filters">
      <span>Filter By</span>
      <Select
        value={filter}
        onChange={(selectedFilter: ListingsFilter) => setFilter(selectedFilter)}
      >
        <Option value={ListingsFilter.PRICE_LOW_TO_HIGH}>
          Price: Low to High
        </Option>
        <Option value={ListingsFilter.PRICE_HIGH_TO_LOW}>
          Price: High to Low
        </Option>
      </Select>
    </div>
  );
};
