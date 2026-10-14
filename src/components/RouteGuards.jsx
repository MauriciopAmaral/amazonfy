import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/contexts";
import { ErrorState, Loading } from "./StatusMessage";

/** Só deixa passar quem está logado; senão manda para /login e volta depois. */
export const RequireAuth = () => {
  const { user, status, error, retry } = useAuth();
  const location = useLocation();

  if (status === "loading") return <Loading text="Verificando sua sessão..." />;
  if (status === "error") return <ErrorState error={error} onRetry={retry} title="Servidor indisponível" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
};

export const RequireAdmin = () => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
};

/** Login/cadastro: quem já está logado volta para a página que pediu (ou a Home). */
export const GuestOnly = () => {
  const { user, status } = useAuth();
  const location = useLocation();
  if (status === "loading") return <Loading />;
  if (user) {
    const from = location.state?.from;
    const to = from ? `${from.pathname}${from.search ?? ""}` : "/";
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
};
