import React from "react";
import "./globals.css";
import "tailwindcss/tailwind.css";
import RootLayout from "./layout";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import toast, { Toaster, ToastBar } from "react-hot-toast";
import { useMyQueryClient } from "@/hooks/useMyQueryClient";
import { Provider } from "jotai";


function MyApp({
  Component,
  pageProps,
}: {
  Component: React.ElementType;
  pageProps: any;
}) {
  // declaring here to prevent re-declaration on every render
  // better for safety and performance
  const myClient = useMyQueryClient();
  return (
    <Provider>
    <QueryClientProvider client={myClient}>
      <Toaster>
        {(t) => (
          <ToastBar
            // configuration for every toast
            toast={t}
            style={{
              background: "#1f2937",
              color: "#f9fafb",
              border: "1px solid #1f2937",
              borderRadius: "4px",
            }}
          >
            {({ icon, message }) => (
              <>
                {/* layout for the toast */}
                {icon}
                {message}
                <button onClick={() => toast.dismiss(t.id)}>❌</button>
                {/* button to close the toast */}
                {/* might change this emoji later */}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>

      <RootLayout>
        <Component {...pageProps} />
      </RootLayout>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
}

export default MyApp;
