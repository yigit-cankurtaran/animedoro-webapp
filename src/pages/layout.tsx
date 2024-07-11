import React from "react";
import Footer from "@/things/Footer";
import Header from "@/things/Header";

interface Props {
  children: React.ReactNode;
}

const RootLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex flex-col justify-between bg-slate-800 min-h-screen h-full w-full text-black">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
