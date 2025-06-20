import { FC, useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../ProtectedRoute/ProtectedRoute';
import API_BASE_URL from '../../constants/PAGE_URL';
import axios from 'axios';
import './ListUsersDialog.css';
import '../CuadroDialogoInput/CuadroDialogoInput.css';

interface User {
  id: number;
  name: string;
}

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (usernames: string[]) => void;
  fileName: string;
  isSharing: boolean;
  currentFolder: string;
  error: string | null;
}

const ListUsersDialog: FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  onShare,
  fileName,
  isSharing,
  error,
  currentFolder
}) => {
  const { effectiveMode } = useDarkMode();
  const { userId } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);       // editable
  const [initialSelectedUserIds, setInitialSelectedUserIds] = useState<number[]>([]); // copia inicial

  const file_path = currentFolder
    ? `${userId}/${currentFolder}/${fileName}`
    : `${userId}/${fileName}`;

  useEffect(() => {
    if (!isOpen) return;

    const fetchAllUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/list-all-users`);
        const data = await res.json();
        if (data.success) {
          const filtered = data.users.filter((user: User) => user.id !== Number(userId));
          setUsers(filtered);
        } else {
          console.error("Error al listar usuarios:", data.error);
        }
      } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
      }
    };

    const fetchWhoUsersSharedWith = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/fetch-who-users-shared-with`, {
          params: { ownerId: userId, file_path },
          withCredentials: true
        });

        if (res.data.success) {
          const ids: number[] = res.data.sharedWith;
          setSelectedUserIds(ids);
          setInitialSelectedUserIds(ids); // backup para comparar
        } else {
          console.warn("⚠️ No se pudo obtener lista de usuarios compartidos");
        }
      } catch (error) {
        console.error("❌ Error al obtener compartidos:", error);
      }
    };

    fetchAllUsers();
    fetchWhoUsersSharedWith();
  }, [isOpen]);

  const toggleUserSelection = (id: number) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allUserIds = users.map(u => u.id);
    setSelectedUserIds(allUserIds);
  };

  const shareSelectedUsers = async () => {
    const toShare = selectedUserIds.filter(id => !initialSelectedUserIds.includes(id));
    const toUnshare = initialSelectedUserIds.filter(id => !selectedUserIds.includes(id));

    try {
      // Compartir nuevos
      if (toShare.length > 0) {
        const usernames = users.filter(u => toShare.includes(u.id)).map(u => u.name);
        await axios.post(`${API_BASE_URL}/api/shareFile`, {
          fileName,
          folder: currentFolder,
          userId,
          usernames
        }, { withCredentials: true });
        console.log("✅ Compartidos con:", usernames);
      }

      // Descompartir (en grupo)
      if (toUnshare.length > 0) {
        await axios.post(`${API_BASE_URL}/api/unshare-file`, {
          ownerId: userId,
          file_path,
          userIdsToRemove: toUnshare
        }, { withCredentials: true });
        console.log("❌ Descompartido con:", toUnshare);
      }

      const usernamesFinal = users
        .filter(u => selectedUserIds.includes(u.id))
        .map(u => u.name);

      onShare(usernamesFinal);
      onClose();
    } catch (error) {
      console.error("❌ Error en compartir/descompartir:", error);
    }
  };


  if (!isOpen) return null;

  return (
    <div className={`dialog-overlay ${effectiveMode === 'dark' ? 'dark' : ''}`}>
      <div className={`dialog-content ${effectiveMode === 'dark' ? 'dark' : ''}`}>
        <h2 className={`dialog-title ${effectiveMode === 'dark' ? 'dark' : ''}`}>
          Compartir archivo: {fileName}
        </h2>

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

        <div className="dialog-buttons">
          <button onClick={onClose} className="close-button">Cerrar</button>
          <button onClick={handleSelectAll}>Seleccionar todos</button>
          <button
            className="share-button-ok"
            disabled={isSharing}
            onClick={shareSelectedUsers}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListUsersDialog;
