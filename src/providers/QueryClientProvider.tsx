import { QueryClient, QueryClientProvider as DefaultQueryClientProvider } from "@tanstack/react-query";
import { FC, PropsWithChildren } from "react";

export const QueryClientProvider: FC<PropsWithChildren> = ({ children }) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        gcTime: 5 * 60 * 1000,
        staleTime: 5 * 60 * 1000,
        retry: false,
      },
    },
  });

  return <DefaultQueryClientProvider client={client}>{children}</DefaultQueryClientProvider>;
};
