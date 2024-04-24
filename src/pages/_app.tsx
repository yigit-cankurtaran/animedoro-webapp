import React from "react";
import "./globals.css"; // Import your global styles here
import "tailwindcss/tailwind.css"; // Import Tailwind CSS

function MyApp({
  Component,
  pageProps,
}: {
  Component: React.ElementType;
  pageProps: any;
}) {
  // these show errors but we can fix later
  // it works anyway
  return <Component {...pageProps} />;
}

export default MyApp;
