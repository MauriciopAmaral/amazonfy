import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useCatalog } from "../context/contexts";
import { ErrorState, Loading } from "./StatusMessage";

/** Área logada: espera o catálogo carregar antes de mostrar as páginas. */
const AppLayout = () => {
  const { status, error, reload } = useCatalog();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (status === "loading") return <Loading text="Carregando o catálogo..." />;
  if (status === "error") return <ErrorState error={error} onRetry={reload} title="Não foi possível carregar o catálogo" />;
  return <Outlet />;
};

export default AppLayout;
