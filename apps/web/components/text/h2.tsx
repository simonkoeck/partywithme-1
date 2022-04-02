import React, { ReactElement } from 'react';

interface Props {
  text: string;
}

export default function H2(props: Props): ReactElement {
  return (
    <h2 className="relative text-4xl font-extrabold text-gray-800 before:bg-primary before:w-[0.48rem] before:h-full before:absolute before:rounded-md before:top-0 before:left-[-1rem]">
      {props.text}
    </h2>
  );
}
