/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactElement } from 'react';
import PrimaryButton from './buttons/primary-button';
import { HiDownload } from 'react-icons/hi';

export default function Header(): ReactElement {
  const { push } = useRouter();

  return (
    <div className="flex flex-row flex-wrap items-center justify-between px-3 py-8 sm:px-16">
      <div
        className="flex flex-row items-center mx-auto my-2 transition-all duration-300 cursor-pointer hover:scale-105 sm:mx-0 sm:my-0"
        onClick={() => {
          push('/');
        }}
      >
        <img src="/assets/images/party.png" className="w-8 mr-4" alt="logo" />
        <span className="text-xl font-bold">Party With Me</span>
      </div>
      <div className="flex flex-row justify-center gap-6 mx-auto my-2 md:gap-16 text-md sm:mx-0 sm:my-0">
        <LinkItem text="Features" href="#features" />
        <LinkItem text="Download" href="/download" />
        <LinkItem
          text="Github"
          href="https://github.com/simplifylabs/partywithme"
        />
      </div>
      <div className="mx-auto my-2 sm:mx-0 sm:my-0">
        <PrimaryButton
          icon={<HiDownload />}
          text="Download now"
          onClick={() => {
            push('/download');
          }}
        />
      </div>
    </div>
  );
}

interface LinkItemProps {
  text: string;
  href: string;
}

function LinkItem({ text, href }: LinkItemProps): ReactElement {
  return (
    <Link href={href} passHref>
      <a className="transition cursor-pointer hover:text-gray-600">{text}</a>
    </Link>
  );
}
