import { ReactNode } from "react";
import { FormProvider, FieldValues } from "react-hook-form";

import { IFormReturn } from "../hooks/useForm";

import { FormContext } from "./Form.context";

interface IProps<Values extends FieldValues> extends IFormReturn<Values> {
  children: ReactNode;
  className?: string;
}

export const Form = <Values extends FieldValues>({
  children,
  submit,
  schema,
  className,
  ...methods
}: IProps<Values>) => {
  return (
    <FormProvider {...methods}>
      <form onSubmit={submit} className={className}>
        <FormContext.Provider value={{ submit, schema } as Pick<IFormReturn, "submit" | "schema">}>
          {children}
        </FormContext.Provider>
      </form>
    </FormProvider>
  );
};
