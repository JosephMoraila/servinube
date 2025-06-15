import { FC, useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { ListUsersProps } from '../../interfaces/component.interfaces';
import '../CuadroDialogoInput/CuadroDialogoInput.css';
import API_BASE_URL from '../../constants/PAGE_URL';

const ListUsersDialog: FC<ListUsersProps> = ({ onClose, isOpen }) => {
  const { effectiveMode } = useDarkMode(); // ✅ Hook al principio
  const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]); // ✅ Hook al principio

  // Cierra el modal con tecla ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Obtener usuarios al montar
useEffect(() => {
  if (!isOpen) return; // Solo llama al fetch cuando el modal está abierto

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/list-all-users`);
      console.log('🔍 Fetching all users from API:', response);
      if (!response.ok) throw new Error('Error fetching users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        console.error('Error fetching users:', data.error);
      }
    } catch (error) {
      console.error('❌ Error al listar usuarios:', error);
    }
  };

  fetchAllUsers();
}, [isOpen]); // ← depende de isOpen

  // 👇 Esto debe ir después de los hooks
  if (!isOpen) return null;

  return (
    <div className={`dialog-overlay ${effectiveMode === 'dark' ? 'dark' : ''}`}>
      <div className={`dialog-content ${effectiveMode === 'dark' ? 'dark' : ''}`}>
        <h2 className={`dialog-title ${effectiveMode === 'dark' ? 'dark' : ''}`}>Lista de Usuarios</h2>
        <ul className="user-list">
          {users.map(user => (
            <li key={user.id} className={`user-item ${effectiveMode === 'dark' ? 'dark' : ''}`}>
              {user.name}
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="close-button">Cerrar</button>
      </div>
    </div>
  );
};

export default ListUsersDialog;
