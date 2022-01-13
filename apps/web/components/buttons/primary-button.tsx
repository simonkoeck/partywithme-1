import React, { ReactElement } from "react";

interface Props {
  text: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default function PrimaryButton({ text, onClick }: Props): ReactElement {
  return (
    <button
      className="font-bold text-white bg-primary py-2 px-5 rounded-md"
      onClick={onClick}
    >
      {text}
    </button>
  );
}
