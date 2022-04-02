import React, { ReactElement } from 'react';
import Footer from './footer';
import Header from './header';

interface Props {
  children: React.ReactElement | React.ReactElement[];
  contentPadding?: boolean;
}

export default function Layout({
  children,
  contentPadding,
}: Props): ReactElement {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div
        className={`w-full ${
          contentPadding == false
            ? 'p-0 mx-0 my-0'
            : 'p-5 sm:w-1/2 mx-auto my-10 sm:p-0'
        }`}
      >
        {children}
      </div>
      <Footer />
    </div>
  );
}
