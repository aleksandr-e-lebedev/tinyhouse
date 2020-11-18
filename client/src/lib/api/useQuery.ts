import { useState, useEffect, useCallback } from 'react';

import { server } from './server';

interface State<TData> {
  data: TData | null;
}

interface QueryResult<TData> extends State<TData> {
  refetch: () => void;
}

export const useQuery = <TData = unknown>(
  query: string
): QueryResult<TData> => {
  const [state, setState] = useState<State<TData>>({ data: null });

  const fetch = useCallback(() => {
    const fetchData = async () => {
      const { data } = await server.fetch<TData>({ query });
      setState({ data });
    };

    void fetchData();
  }, [query]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...state, refetch: fetch };
};
