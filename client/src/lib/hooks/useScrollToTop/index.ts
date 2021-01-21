import { useLayoutEffect } from 'react';

export const useScrollToTop = (): void => {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};
