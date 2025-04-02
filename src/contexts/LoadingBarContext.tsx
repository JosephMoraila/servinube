import React, { createContext, useContext, useState, ReactNode } from "react";

// Definimos el tipo del contexto
type LoadingBarContextType = {
  isLoadingBar: boolean;
  setIsLoadingBar: React.Dispatch<React.SetStateAction<boolean>>;
};

// Creamos el contexto con valores por defecto
const LoadingBarContext = createContext<LoadingBarContextType | undefined>(
  undefined
);

// Componente proveedor del contexto
export const LoadingBarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoadingBar, setIsLoadingBar] = useState<boolean>(false);

  return (
    <LoadingBarContext.Provider value={{ isLoadingBar, setIsLoadingBar }}>
      {children}
    </LoadingBarContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useLoadingBar = (): LoadingBarContextType => {
  const context = useContext(LoadingBarContext);
  if (!context) {
    throw new Error("useLoadingBar debe usarse dentro de un LoadingBarProvider");
  }
  return context;
};
