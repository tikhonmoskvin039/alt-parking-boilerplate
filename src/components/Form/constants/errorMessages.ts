import type { FieldError } from "react-hook-form";

export enum ErrorMessages {
  Required = "Поле обязательно",
}

export const errorMessages: Partial<Record<FieldError["type"], string>> = {
  required: ErrorMessages.Required,
  optionality: ErrorMessages.Required,
};
