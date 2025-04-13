import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define el tipo para el contexto
interface MessageContextType {
  messageMessageBox: string;
  setMessageMessageBox: React.Dispatch<React.SetStateAction<string>>;
  colorMessageBox: string;
  setColorMessageBox: React.Dispatch<React.SetStateAction<string>>;
}

// Crea el contexto con un valor inicial vacío
const MessageBoxContext = createContext<MessageContextType | undefined>(undefined);

// Proveedor del contexto
export const MessageBoxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messageMessageBox, setMessageMessageBox] = useState("");
  const [colorMessageBox, setColorMessageBox] = useState("#008000"); // Color inicial (verde)

  useEffect(() => {
    // Establece un temporizador para restablecer el mensaje y color después de 3 segundos
    if (messageMessageBox || colorMessageBox !== "#008000") {
      const timer = setTimeout(() => {
        setMessageMessageBox(""); // Restablece el mensaje
        setColorMessageBox("#008000"); // Restablece el color
      }, 3000);

      // Limpia el temporizador cuando el componente se desmonta o cambia el estado
      return () => clearTimeout(timer);
    }
  }, [messageMessageBox, colorMessageBox]); // Se ejecuta cada vez que `messageMessageBox` o `colorMessageBox` cambia

  return (
    <MessageBoxContext.Provider value={{ messageMessageBox, setMessageMessageBox, colorMessageBox, setColorMessageBox }}>
      {children}
    </MessageBoxContext.Provider>
  );
};

// Hook para usar el contexto
export const useMessageBoxContext = (): MessageContextType => {
  const context = useContext(MessageBoxContext);
  if (!context) {
    throw new Error("useMessageBoxContext must be used within MessageBoxProvider");
  }
  return context;
};
