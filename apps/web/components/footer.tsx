import Link from 'next/link';
import React, { ReactElement } from 'react';
import {
  FaInstagram,
  FaGooglePlay,
  FaAppStore,
  FaGithub,
} from 'react-icons/fa';

export default function Footer(): ReactElement {
  return (
    <div className="py-6 mt-auto text-center bg-gray-200">
      <div className="flex flex-row items-center justify-center gap-6 cursor-pointer">
        <a
          href="https://play.google.com/store/apps/details?id=com.simplifysoftware.partywithme"
          target="_blank"
          rel="noreferrer"
        >
          <FaGooglePlay size={20} className="text-gray-600" />
        </a>
        <a
          href="https://www.apple.com/app-store/"
          target="_blank"
          rel="noreferrer"
        >
          <FaAppStore size={26} className="text-gray-600" />
        </a>
        <a
          href="https://www.instagram.com/partywithme_app"
          target="_blank"
          rel="noreferrer"
        >
          <FaInstagram size={26} className="text-gray-600" />
        </a>
        <a
          href="https://github.com/simplifylabs/partywithme"
          target="_blank"
          rel="noreferrer"
        >
          <FaGithub size={26} className="text-gray-600" />
        </a>
      </div>
      <div className="flex flex-row justify-center gap-3 my-2 md:gap-8">
        <FooterLink href="/about-us" text="About us" />
        <FooterLink href="/privacy-policy" text="Privacy Policy" />
        <FooterLink href="/terms-and-conditions" text="Terms and Conditions" />
      </div>
      <div className="text-sm text-center text-gray-600">
        © 2021 Copyright Simplify Software
        <br />
        All rights reserved.
      </div>
    </div>
  );
}

interface FooterLinkProps {
  text: string;
  href: string;
}

function FooterLink({ text, href }: FooterLinkProps) {
  return (
    <Link href={href} passHref>
      <a className="cursor-pointer text-primary">{text}</a>
    </Link>
  );
}
