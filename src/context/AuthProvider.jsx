import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { AuthContext } from "./contexts";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);

  const checkSession = useCallback(async () => {
    setStatus("loading");
    try {
      const { user } = await api.me();
      setUser(user);
      setError(null);
      setStatus("ready");
    } catch (err) {
      setError(err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (email, password) => {
    const { user } = await api.login(email, password);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { user } = await api.register(name, email, password);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      retry: checkSession,
    }),
    [user, status, error, login, register, logout, checkSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
