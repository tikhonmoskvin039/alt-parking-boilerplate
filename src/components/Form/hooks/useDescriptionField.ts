import { reach } from "yup";

import { useFormContext } from "./useFormContext";

import type { SchemaDescription } from "yup";

interface IMeta {
  placeholder?: string;
}

interface IOtherFields {
  required?: boolean;
}

interface IUseDescriptionField extends Omit<SchemaDescription, "meta">, IOtherFields {
  meta?: IMeta;
}

export const useDescriptionField = (name: string): IUseDescriptionField => {
  const { schema } = useFormContext();

  const description = reach(schema, name).describe() as SchemaDescription;

  const otherDescriptions = description?.tests?.reduce<IOtherFields>((acc, item) => {
    if (!item.name) return acc;

    return { ...acc, [item.name]: true };
  }, {});

  return { ...description, ...otherDescriptions };
};
