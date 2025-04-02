import React, { useEffect, useState } from 'react';
import './MessageBox.css'; // Importamos el archivo CSS

interface MessageBoxProps {
  message: string;
  color?: string; // Parámetro opcional de color
}

const MessageBox: React.FC<MessageBoxProps> = ({ message, color = '#008000' }) => {
  const [visible, setVisible] = useState<boolean>(false); // Inicialmente no visible
  const [currentMessage, setCurrentMessage] = useState<string>(''); // Mensaje actual
  const [currentColor, setCurrentColor] = useState<string>(color); // Color actual

  useEffect(() => {
    // Si el mensaje cambia, mostramos el cuadro y restablecemos el mensaje después de 3 segundos
    if (message) {
      setCurrentMessage(message);
      setVisible(true);

      // Establece un temporizador para ocultar el cuadro después de 3 segundos
      const timer = setTimeout(() => {
        setVisible(false);
        setCurrentMessage(''); // Restablece el mensaje después de desaparecer
      }, 3000);

      // Limpieza del temporizador cuando el componente se desmonta o cuando `message` cambia
      return () => clearTimeout(timer);
    }
  }, [message]); // Se ejecuta cada vez que el `message` cambia

  useEffect(() => {
    // Si el color cambia, lo restablece a #008000 después de 3 segundos
    if (color !== '#008000') {
      const timer = setTimeout(() => {
        setCurrentColor('#008000'); // Restablece el color a verde
      }, 3000);

      // Limpieza del temporizador cuando el componente se desmonta o cuando `color` cambia
      return () => clearTimeout(timer);
    }
  }, [color]); // Se ejecuta cada vez que el `color` cambia

  if (!visible || !currentMessage) {
    return null; // No renderiza el cuadro si no es visible o no hay mensaje
  }

  return (
    <div className="message-box" style={{ backgroundColor: currentColor }}>
      {currentMessage}
    </div>
  );
};

export default MessageBox;
