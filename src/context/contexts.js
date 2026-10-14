import { createContext, useContext } from "react";

export const AuthContext = createContext(null);
export const CatalogContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
export const useCatalog = () => useContext(CatalogContext);
