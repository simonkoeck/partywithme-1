import React, { ReactElement, useState } from "react";

interface Props {
  reference: React.MutableRefObject<HTMLInputElement>;
  label: string;
  inputType: "password" | "email" | "text";
}

export default function TextField({
  reference,
  label,
  inputType,
}: Props): ReactElement {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label
        className={
          "transition duration-100 " +
          (focused ? "text-primary" : "text-gray-800")
        }
      >
        {label}
      </label>
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
        className="rounded-md border-2 outline-none p-2 focus:border-primary text-gray-700"
      />
    </div>
  );
}
