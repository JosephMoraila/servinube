import { FC, useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { ListUsersProps } from '../../interfaces/component.interfaces';
import '../CuadroDialogoInput/CuadroDialogoInput.css';
import './ListUsersDialog.css'; // Asegúrate de tener estilos para el modal
import API_BASE_URL from '../../constants/PAGE_URL';
import { useAuth } from '../ProtectedRoute/ProtectedRoute';

interface User {
  id: number;
  name: string;
}

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onShare: (username: string[]) => void;
    fileName: string;
    isSharing: boolean;
    error: string | null;
}

/**
 * 
 * @param param0 Props del componente ListUsersDialog
 * @param param0.isOpen Indica si el modal está abierto
 * @param param0.onClose Función para cerrar el modal
 * @param param0.onShare Función para compartir un usuario
 * @param param0.fileName Nombre del archivo a compartir
 * @param param0.isSharing Indica si se está compartiendo
 * @returns 
 */
const ListUsersDialog: FC<ShareDialogProps> = ({ isOpen,onClose,onShare,fileName,isSharing,error }) => {
  console.log(`isOpen: ${isOpen}, fileName: ${fileName}, isSharing: ${isSharing}, error: ${error}`);
  const { effectiveMode } = useDarkMode(); // ✅ Hook al principio
  const [users, setUsers] = useState<Array<User>>([]); // ✅ Hook al principio
  const { userId } = useAuth(); // Hook para obtener el usuario autenticado

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
      if (data.success && userId !== null) {
        // Filtrar usuarios para excluir al usuario autenticado
        const filteredUsers = data.users.filter((user: { id: number }) => user.id !== Number(userId));
        setUsers(filteredUsers);
      }
      else {
        console.error('Error fetching users:', data.error);
      }

    } catch (error) {
      console.error('❌ Error al listar usuarios:', error);
    }
  };

  fetchAllUsers();
}, [isOpen]); // ← depende de isOpen

  // Estado para manejar la selección de usuarios
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  /**
   * 
   * @param id ID del usuario a seleccionar o deseleccionar
   * Esta función alterna la selección de un usuario.
   * Si el usuario ya está seleccionado, lo deselecciona.
   * Si no está seleccionado, lo selecciona.
   */
  const toggleUserSelection = (id: number) => {
    setSelectedUserIds(prev => // prev es el estado anterior (array de IDs)
      prev.includes(id)         // ¿ya está el ID?
        ? prev.filter(userId => userId !== id) // sí → lo quita
        : [...prev, id]         // no → lo agrega
    );
};

  const handleSelectAll = () => {
  // Selecciona todos los usuarios
  const allUserIds = users.map(user => user.id);
  setSelectedUserIds(allUserIds);
  };

  const shareSelectedUsers = () => {
    // Aquí puedes implementar la lógica para compartir los usuarios seleccionados
    console.log('Compartiendo usuarios:', selectedUserIds);
    if (selectedUserIds.length > 0) {
      const usernames = users
        .filter(user => selectedUserIds.includes(user.id))
        .map(user => user.name);
      onShare(usernames); // Llama a la función onShare con los nombres de usuario seleccionados
    }
    
  }

  // 👇 Esto debe ir después de los hooks
  if (!isOpen) return null;

  return (
    <div className={`dialog-overlay ${effectiveMode === 'dark' ? 'dark' : ''}`}>
      <div className={`dialog-content ${effectiveMode === 'dark' ? 'dark' : ''}`}>
        <h2 className={`dialog-title ${effectiveMode === 'dark' ? 'dark' : ''}`}>Lista de Usuarios</h2>
          <ul className="user-list">
            {users.map(user => (
              <li
                key={user.id}
                className={`user-item ${effectiveMode === 'dark' ? 'dark' : ''} ${selectedUserIds.includes(user.id) ? 'selected' : ''}`}
                onClick={() => toggleUserSelection(user.id)}
              >
                {user.name}
              </li>
            ))}
          </ul>

        <button onClick={onClose} className="close-button">Cerrar</button>
        <button onClick={handleSelectAll}>Seleccionar todos</button>
        <button className='share-button-ok' disabled={isSharing} onClick={shareSelectedUsers}>Compartir</button>
      </div>
    </div>
  );
};

export default ListUsersDialog;
