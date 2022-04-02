import React, { ReactElement } from 'react';

interface Props {
  text: string;
}

export default function H1(props: Props): ReactElement {
  return (
    <h1 className="text-4xl font-extrabold text-gray-800">{props.text}</h1>
  );
}
