import React, { ReactElement, useState } from 'react';

interface Props {
  reference: React.MutableRefObject<HTMLInputElement>;
  label: string;
  inputType: 'password' | 'email' | 'text';
}

export default function TextField({
  reference,
  label,
  inputType,
}: Props): ReactElement {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label className={'transition duration-100 text-gray-800'}>{label}</label>
      <br />
      <input
        type={inputType}
        ref={reference}
        onFocus={(e) => {
          setFocused(true);
        }}
        onBlur={(e) => {
          setFocused(false);
        }}
        className="p-2 text-gray-700 border-2 rounded-md outline-none focus:border-primary"
      />
    </div>
  );
}
