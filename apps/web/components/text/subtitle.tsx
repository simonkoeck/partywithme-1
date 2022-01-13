import React, { ReactElement } from "react";

interface Props {
  text: string;
}

export default function SubTitle({ text }: Props): ReactElement {
  return (
    <div className="text-primary capitalize font-bold text-xl">
      {text.toUpperCase()}
    </div>
  );
}
