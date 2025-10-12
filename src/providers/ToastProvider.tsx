import { ToastProvider as DefaultToastProvider } from "@heroui/toast";
import { FC, PropsWithChildren } from "react";

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => (
  <>
    <DefaultToastProvider />
    {children}
  </>
);
