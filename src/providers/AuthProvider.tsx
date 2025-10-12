import { noop } from "lodash";
import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";

export interface AuthState {
  isAuth: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({ isAuth: false, logout: noop });

export const useAuthState = () => useContext(AuthContext);

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setIsAuth(false);
  }, []);

  const value = useMemo(() => ({ isAuth, logout }), [isAuth, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
