import React, { ReactElement } from "react";

interface Props {
  text: string;
  type: "DANGER" | "SUCCESS";
}

export default function Alert({ type, text }: Props): ReactElement {
  return (
    <div
      className={
        (type == "DANGER"
          ? "text-red-600 bg-red-200 border-red-600 "
          : "text-green-600 bg-green-100 border-green-600 ") +
        "border-2 rounded-md py-2 px-5 my-3"
      }
    >
      {text}
    </div>
  );
}
