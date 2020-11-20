import { useReducer, useEffect, useCallback } from 'react';

import { server } from './server';

interface State<TData> {
  data: TData | null;
  loading: boolean;
  error: boolean;
}

type Action<TData> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: TData }
  | { type: 'FETCH_FAILURE' };

interface QueryResult<TData> extends State<TData> {
  refetch: () => void;
}

const reducer = <TData>() => (
  state: State<TData>,
  action: Action<TData>
): State<TData> => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: false };
    case 'FETCH_SUCCESS':
      return { ...state, data: action.payload, loading: false, error: false };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: true };
    default:
      throw new Error();
  }
};

export const useQuery = <TData = unknown>(
  query: string
): QueryResult<TData> => {
  const fetchReducer = reducer<TData>();
  const [state, dispatch] = useReducer(fetchReducer, {
    data: null,
    loading: false,
    error: false,
  });

  const fetch = useCallback(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_START' });

        const { data, errors } = await server.fetch<TData>({ query });

        if (errors?.length) throw new Error(errors[0].message);

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAILURE' });
        console.log(err);
      }
    };

    void fetchData();
  }, [query]);

  useEffect(fetch, [fetch]);

  return { ...state, refetch: fetch };
};
