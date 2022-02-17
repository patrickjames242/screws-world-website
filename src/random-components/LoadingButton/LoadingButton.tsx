import React from "react";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import "./LoadingButton.scss";

export interface LoadingButtonProps {
  className?: string;
  shouldShowIndicator: boolean;
  children?: React.ReactNode;
  loadingIndicatorSize?: string;
  isActive?: boolean;
  onClick?: React.MouseEventHandler;
}

export default function LoadingButton(props: LoadingButtonProps) {
  const className = ["LoadingButton", props.className].join(" ");

  const loadingIndicatorSize = props.loadingIndicatorSize ?? "20.8px";

  return (
    <button
      className={className}
      style={{
        opacity: props.isActive === false ? 0.3 : undefined,
        pointerEvents:
          props.shouldShowIndicator || props.isActive === false
            ? "none"
            : undefined,
      }}
      onClick={props.onClick}
    >
      {props.shouldShowIndicator ? (
        <LoadingIndicator
          style={{ height: loadingIndicatorSize, width: loadingIndicatorSize }}
        />
      ) : null}

      <div
        style={{
          opacity: props.shouldShowIndicator ? 0 : undefined,
        }}
      >
        {props.children}
      </div>
    </button>
  );
}
