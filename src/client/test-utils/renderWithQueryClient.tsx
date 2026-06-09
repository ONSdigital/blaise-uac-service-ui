import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { type PropsWithChildren, type ReactElement } from "react";

type Options = Omit<RenderOptions, "wrapper"> & {
  queryClient?: QueryClient;
};

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createQueryClientWrapper(queryClient: QueryClient) {
  return function QueryClientWrapper({ children }: PropsWithChildren): ReactElement {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

export function renderWithQueryClient(ui: ReactElement, options: Options = {}) {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options;

  return {
    queryClient,
    ...render(ui, {
      wrapper: createQueryClientWrapper(queryClient),
      ...renderOptions,
    }),
  };
}
