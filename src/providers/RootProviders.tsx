import { HeroUIProvider } from "@heroui/react";
import { FC, PropsWithChildren } from "react";

import { AuthProvider } from "./AuthProvider";
import { QueryClientProvider } from "./QueryClientProvider";
import { ToastProvider } from "./ToastProvider";

const providers = [HeroUIProvider, ToastProvider, AuthProvider, QueryClientProvider];

export const RootProviders: FC<PropsWithChildren> = ({ children }) =>
  providers.reduce((sum, Provider) => <Provider>{sum}</Provider>, children);
