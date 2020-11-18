interface Body<TVariables> {
  query: string;
  variables?: TVariables;
}

interface Error {
  message: string;
}

export const server = {
  fetch: async <TData = unknown, TVariables = unknown>(
    body: Body<TVariables>
  ): Promise<{ data: TData; errors: Error[] }> => {
    const res = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('Failed to fetch from server');

    return res.json() as Promise<{ data: TData; errors: Error[] }>;
  },
};
