import React from "react";
import "./globals.css"; // Import your global styles here
import "tailwindcss/tailwind.css"; // Import Tailwind CSS
import RootLayout from "./layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

// declaring this outside because no backend yet
// in event that i implement this with a backend
// create a state and push it in the app, with auth

const myClient = new QueryClient();

function MyApp({
  Component,
  pageProps,
}: {
  Component: React.ElementType;
  pageProps: any;
}) {
  return (
    <QueryClientProvider client={myClient}>
      <Toaster />
      <RootLayout>
        <Component {...pageProps} />
      </RootLayout>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default MyApp;
