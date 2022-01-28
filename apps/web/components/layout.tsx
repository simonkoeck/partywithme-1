import React, { ReactElement } from 'react';
import Footer from './footer';
import Header from './header';

interface Props {
  children: React.ReactElement | React.ReactElement[];
}

export default function Layout({ children }: Props): ReactElement {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="w-full p-5 sm:p-0 sm:w-1/2 mx-auto my-10">{children}</div>
      <Footer />
    </div>
  );
}
