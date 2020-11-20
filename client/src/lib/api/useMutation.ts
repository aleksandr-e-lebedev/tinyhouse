import { useReducer } from 'react';

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

type MutationTuple<TData, TVariables> = [
  (variables?: TVariables) => Promise<void>,
  State<TData>
];

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

export const useMutation = <
  TData = unknown,
  TVariables = Record<string, unknown>
>(
  query: string
): MutationTuple<TData, TVariables> => {
  const fetchReducer = reducer<TData>();
  const [state, dispatch] = useReducer(fetchReducer, {
    data: null,
    loading: false,
    error: false,
  });

  const fetch = async (variables?: TVariables) => {
    try {
      dispatch({ type: 'FETCH_START' });

      const { data, errors } = await server.fetch<TData, TVariables>({
        query,
        variables,
      });

      if (errors?.length) throw new Error(errors[0].message);

      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_FAILURE' });
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw console.error(err); // To prevent refetch() func to execute when a mutation fails
    }
  };

  return [fetch, state];
};
