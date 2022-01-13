import React, { ReactElement } from "react";

interface Props {
  text: string;
}

export default function H1(props: Props): ReactElement {
  return <h1 className="text-5xl font-extrabold">{props.text}</h1>;
}
