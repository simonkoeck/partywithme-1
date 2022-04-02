import React, { ReactElement } from 'react';
import { HiInformationCircle } from 'react-icons/hi';

interface Props {
  text: string;
  type: 'DANGER' | 'SUCCESS' | 'INFO';
}

export default function Alert({ type, text }: Props): ReactElement {
  return (
    <div
      className={
        (type == 'DANGER'
          ? 'text-red-600 bg-red-200 border-red-600 '
          : type == 'SUCCESS'
          ? 'text-green-600 bg-green-100 border-green-600 '
          : 'text-yellow-600 bg-yellow-100 border-yellow-600 ') +
        'border-2 rounded-md py-2 px-5 my-3 flex  items-center gap-4'
      }
    >
      {type == 'INFO' && <HiInformationCircle className="text-2xl" />}
      {text}
    </div>
  );
}
