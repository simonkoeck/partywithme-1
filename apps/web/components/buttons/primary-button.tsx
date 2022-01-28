import React, { ReactElement } from 'react';

interface Props {
  text: string;
  icon?: any;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default function PrimaryButton({
  text,
  onClick,
  icon,
}: Props): ReactElement {
  return (
    <button
      className="font-bold text-white bg-primary py-2 px-5 rounded-md flex flex-row gap-4 items-center"
      onClick={onClick}
    >
      {icon != null && <span className="text-xl">{icon}</span>}
      <span>{text}</span>
    </button>
  );
}
