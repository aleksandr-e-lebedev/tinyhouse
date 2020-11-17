interface Body<TVariables> {
  query: string;
  variables?: TVariables;
}

export const server = {
  fetch: async <TData = unknown, TVariables = unknown>(
    body: Body<TVariables>
  ): Promise<{ data: TData }> => {
    const res = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return res.json() as Promise<{ data: TData }>;
  },
};
