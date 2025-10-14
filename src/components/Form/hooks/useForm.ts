import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormMain } from "react-hook-form";

import type {
  FieldValues,
  Resolver,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import type { ObjectSchema } from "yup";

export interface IFormReturn<Values extends FieldValues = FieldValues> extends UseFormReturn<Values> {
  submit: () => void;
  schema: ObjectSchema<Values>;
}

interface IProps<Values extends FieldValues> extends UseFormProps<Values> {
  schema: ObjectSchema<Values>;
  onSuccess: SubmitHandler<Values>;
  onError?: SubmitErrorHandler<Values>;
}

export const useForm = <Values extends FieldValues = FieldValues>({
  schema,
  onSuccess,
  onError,
  defaultValues,
  ...props
}: IProps<Values>): IFormReturn<Values> => {
  const resolver = yupResolver(schema) as Resolver<Values>;
  const methods: UseFormReturn<Values> = useFormMain({
    ...props,
    resolver,
    defaultValues: { ...schema.getDefault(), ...defaultValues },
  });

  const { handleSubmit } = methods;

  const submit = handleSubmit(onSuccess, onError);

  return { submit, schema, ...methods };
};
