import React from "react";
import "./globals.css"; // Import your global styles here
import "tailwindcss/tailwind.css"; // Import Tailwind CSS
import RootLayout from "./layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5,
      // 5 minutes
      staleTime: 1000 * 60 * 1,
      // 1 minute
      // this is the time it will wait before it refetches the data
    },
  },
});

function MyApp({
  Component,
  pageProps,
}: {
  Component: React.ElementType;
  pageProps: any;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayout>
        <Component {...pageProps} />
      </RootLayout>
    </QueryClientProvider>
  );
}

export default MyApp;
