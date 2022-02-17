import React from "react";
import "./CustomTextField.scss";
import CustomInput, { CustomInputProps } from "../CustomInput";

export enum CustomTextFieldType {
  SingleLine,
  MultipleLine,
}

export interface CustomTextFieldProps extends CustomInputProps<string> {
  type?: CustomTextFieldType;
  placeholderText: string;
  isPassword?: boolean;
}

export default function CustomTextField(props: CustomTextFieldProps) {
  function handleChange(event: Event) {
    props.onValueChange?.((event.target as any).value ?? "");
  }

  const inputElement = (inputProps: {
    className: string;
    onFocus: () => void;
    onBlur: () => void;
    style: React.CSSProperties;
  }) => {
    let elementType, typeProp;

    switch (props.type) {
      case CustomTextFieldType.MultipleLine:
        elementType = "textarea";
        break;
      default:
        elementType = "input";
        typeProp = props.isPassword ?? false ? "password" : "text";
        break;
    }

    const propDict = {
      required: props.isRequired ?? false,
      value: props.value,
      className: inputProps.className,
      placeholder: props.placeholderText,
      onFocus: inputProps.onFocus,
      onBlur: inputProps.onBlur,
      type: typeProp,
      onChange: handleChange,
      style: inputProps.style,
      disabled: props.isEnabled ?? true ? undefined : true,
    };

    return React.createElement(elementType, propDict);
  };

  const className = ["CustomTextField", props.className ?? ""].join(" ");

  return (
    <CustomInput {...props} className={className}>
      {inputElement}
    </CustomInput>
  );
}
