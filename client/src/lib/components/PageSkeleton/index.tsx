import React from 'react';
import { Skeleton } from 'antd';

import './styles/PageSkeleton.css';

export const PageSkeleton = (): JSX.Element => {
  const skeletonParagraph = (
    <Skeleton
      active
      paragraph={{ rows: 4 }}
      className="page-skeleton__paragraph"
    />
  );

  return (
    <>
      {skeletonParagraph}
      {skeletonParagraph}
      {skeletonParagraph}
    </>
  );
};
