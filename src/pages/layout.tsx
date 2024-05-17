import React from "react";

interface Props {
  children: React.ReactNode;
}

const RootLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="bg-slate-500 min-h-screen min-w-screen h-full w-full text-black">
      {/* using body here was bugged. */}
      {children}
    </div>
  );
};

export default RootLayout;
