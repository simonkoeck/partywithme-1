import React, { ReactElement } from 'react';

interface Props {
  text: string;
  icon?: ReactElement;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default function PrimaryButton({
  text,
  onClick,
  icon,
}: Props): ReactElement {
  return (
    <button
      className="flex flex-row items-center gap-4 px-5 py-2 font-bold text-white rounded-md bg-primary"
      onClick={onClick}
    >
      {icon != null && <span className="text-xl">{icon}</span>}
      <span>{text}</span>
    </button>
  );
}
