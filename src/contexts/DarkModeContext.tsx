import React, { createContext, useContext, useState, useEffect } from 'react';

interface DarkModeContextProps {
  mode: string; // Puede ser "dark", "light", o "system"
  effectiveMode: string; // Modo efectivo, siempre será "dark" o "light"
  toggleMode: () => void; // Alterna entre los modos
}

// Crear el contexto
const DarkModeContext = createContext<DarkModeContextProps | undefined>(undefined);

// Proveedor del contexto
export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado inicial del modo (se obtiene del localStorage o se asigna a "system")
  const [mode, setMode] = useState(() => {
    const storedMode = localStorage.getItem('themeMode');
    return storedMode || "system";
  });

  // Función para determinar el modo efectivo (considera el modo "system")
  const getEffectiveMode = () => {
    if (mode === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return mode;
  };

  // Función para alternar entre los modos ("dark", "light", "system")
  const toggleMode = () => {
    setMode(prevMode => {
      const newMode = prevMode === "dark" ? "light" : prevMode === "light" ? "system" : "dark";
      localStorage.setItem('themeMode', newMode); // Guardar en localStorage
      return newMode;
    });
  };

  // Efecto para aplicar la clase CSS basada en el modo efectivo
  useEffect(() => {
    const effectiveMode = getEffectiveMode();
    document.body.classList.toggle('dark-mode', effectiveMode === "dark");
  }, [mode]);

  // Proveer el estado, la función de alternancia y el modo efectivo al contexto
  return (
    <DarkModeContext.Provider value={{ mode, toggleMode, effectiveMode: getEffectiveMode() }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Hook personalizado para consumir el contexto
export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};
