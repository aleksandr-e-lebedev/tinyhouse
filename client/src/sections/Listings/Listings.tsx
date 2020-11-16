import React from 'react';

interface Props {
  title: string;
}

export const Listings = ({ title }: Props): JSX.Element => {
  return <h2>{title}</h2>;
};
