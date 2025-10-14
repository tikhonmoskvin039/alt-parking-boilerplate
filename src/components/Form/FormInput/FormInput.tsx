import { Input, InputProps } from "@heroui/react";
import classNames from "classnames";
import { FC } from "react";
import { useController } from "react-hook-form";

import { errorMessages } from "../constants/errorMessages";
import { useDescriptionField } from "../hooks/useDescriptionField";
import { useFormContext } from "../hooks/useFormContext";

import classes from "./FormInput.module.scss";

interface Props extends Omit<InputProps, "onChange" | "value" | "onBlur" | "ref"> {
  name: string;
  hideErrorField?: boolean;
}

export const FormInput: FC<Props> = ({
  name,
  label,
  placeholder,
  isRequired,
  hideErrorField,
  classNames: defaultClassNames,
  description,
  ...props
}) => {
  const { control } = useFormContext();

  const {
    field,
    fieldState: { invalid, error },
  } = useController({ name, control });

  const { meta, required, label: formLabel } = useDescriptionField(name);

  return (
    <Input
      id={name}
      label={label || formLabel}
      isRequired={isRequired || required}
      placeholder={placeholder || meta?.placeholder}
      isInvalid={invalid}
      errorMessage={(error?.type && errorMessages[error.type]) || error?.message}
      labelPlacement="outside"
      description={description || (hideErrorField ? undefined : " ")}
      classNames={{
        ...defaultClassNames,
        description: classNames(hideErrorField ? undefined : classes.errorField, defaultClassNames?.description),
      }}
      {...field}
      {...props}
    />
  );
};
