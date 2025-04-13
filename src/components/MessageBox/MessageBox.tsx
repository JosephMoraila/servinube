import React, { useEffect, useState } from 'react';
import './MessageBox.css';
import { useMessageBoxContext } from '../../contexts/MessageBoxContext';

interface MessageBoxProps {
  message: string;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const { colorMessageBox } = useMessageBoxContext();

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        setCurrentMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!visible || !currentMessage) {
    return null;
  }

  return (
    <div className="message-box" style={{ backgroundColor: colorMessageBox }}>
      {currentMessage}
    </div>
  );
};

export default MessageBox;
