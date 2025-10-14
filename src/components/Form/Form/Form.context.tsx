import { createContext } from "react";

import { IFormReturn } from "../hooks/useForm";

export const FormContext = createContext({} as Pick<IFormReturn, "submit" | "schema">);
