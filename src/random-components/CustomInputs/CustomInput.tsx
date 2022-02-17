import React, { useState, CSSProperties } from "react";
import "./CustomInput.scss";

export interface CustomInputProps<ValueType> {
  readonly topText?: string;
  readonly className?: string;
  readonly isRequired?: boolean;
  readonly isEnabled?: boolean;
  readonly value?: ValueType;
  readonly onValueChange?: (newValue: ValueType) => void;
}

export type CustomInputChildParams = {
  className: string;
  style: React.CSSProperties;
  onFocus: () => void;
  onBlur: () => void;
};

export type CustomInputChild = (
  params: CustomInputChildParams
) => React.ReactElement;

export default function CustomInput<ValueType>(
  props: CustomInputProps<ValueType> & { children: CustomInputChild }
) {
  const [isInFocus, setIsInFocus] = useState(false);

  const className = [
    "CustomInput",
    props.className ?? "",
    isInFocus ? "active" : "",
  ].join(" ");

  function respondToOnFocus() {
    setIsInFocus(true);
  }

  function respondToOnBlur() {
    setIsInFocus(false);
  }

  const childStyle: CSSProperties = {
    opacity: props.isEnabled ?? true ? undefined : 0.5,
    pointerEvents: props.isEnabled ?? true ? undefined : "none",
  };

  const child = props.children({
    className: "input-box",
    onFocus: respondToOnFocus,
    onBlur: respondToOnBlur,
    style: childStyle,
  });

  return (
    <div className={className}>
      {(() => {
        if (props.topText !== undefined) {
          return <div className="top-text">{props.topText}</div>;
        }
      })()}
      {child}
    </div>
  );
}
