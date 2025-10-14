import { useContext } from "react";
import { FieldValues, useFormContext as useFormContextMain } from "react-hook-form";

import { FormContext } from "../Form/Form.context";

import { IFormReturn } from "./useForm";

export const useFormContext = <Values extends FieldValues = FieldValues>(): IFormReturn<Values> => {
  const mainContext = useFormContextMain<Values>();
  const context = useContext(FormContext);

  return { ...mainContext, ...context } as IFormReturn<Values>;
};
