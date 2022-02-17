import "./ErrorMessageBox.scss";
import React from "react";
import errorIcon from "assets/errorIcon";

export default function ErrorMessageBox(props: {
  errorMessage: string;
  className?: string;
}) {
  const className = ["ErrorMessageBox", props.className ?? ""].join(" ");

  return (
    <div className={className}>
      {errorIcon}
      <div className="text-box">{props.errorMessage}</div>
    </div>
  );
}
