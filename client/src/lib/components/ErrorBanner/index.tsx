import React from 'react';
import { Alert } from 'antd';

import './styles/ErrorBanner.css';

interface Props {
  message?: string;
  description?: string;
}

export const ErrorBanner = ({
  message = 'Uh oh! Something went wrong :(',
  description = 'Look like something went wrong. Please check your connection and/or try again later.',
}: Props): JSX.Element => {
  return (
    <Alert
      banner
      closable
      message={message}
      description={description}
      type="error"
      className="error-banner"
    />
  );
};
