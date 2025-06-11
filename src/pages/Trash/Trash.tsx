import { useState, useEffect } from 'react';
import axios from 'axios';
import './Trash.css';
import { useAuth } from '../../components/ProtectedRoute/ProtectedRoute';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useMessageBoxContext } from '../../contexts/MessageBoxContext';
import API_BASE_URL from '../../constants/PAGE_URL';
import ModalPreviewFile from '../../components/ModalPreviewFile/ModalPreviewFile';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

interface TrashFile {
  pathName: string;      // nombre completo con timestamp y ruta
  displayName: string;   // nombre original del archivo
  originalPath: string;  // ubicación original
  timestamp: string;     // timestamp de eliminación
  mimeType?: string | null; // tipo MIME del archivo
  isDirectory: boolean;  // si es directorio o archivo
}

const Trash = () => {
  const [files, setFiles] = useState<TrashFile[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: TrashFile } | null>(null);
  const [preview, setPreview] = useState<{ url: string; type: string; name: string; } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; file: TrashFile | null }>({ 
    isOpen: false, 
    file: null 
  });
  const { userId } = useAuth();
  const { effectiveMode } = useDarkMode();
  const { setMessageMessageBox, setColorMessageBox } = useMessageBoxContext();

  const fetchTrashFiles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/listTrash`, {
        params: { userId },
        withCredentials: true
      });
      
      const trashFiles: TrashFile[] = response.data.files.map((file: any) => {
        const parts = file.name.toString().split('_');
        const timestamp = parts[0];
        const displayName = parts[parts.length - 1];
        const originalPath = parts.slice(1, -1).join('/') || 'raíz';

        return {
          pathName: file.name,
          displayName: displayName,
          originalPath: originalPath,
          timestamp: new Date(parseInt(timestamp)).toLocaleString(),
          mimeType: file.mimeType,
          isDirectory: file.isDirectory
        };
      });
      
      setFiles(trashFiles);
    } catch (error) {
      console.error('Error al obtener archivos de la papelera:', error);
      setColorMessageBox("#ff0000");
      setMessageMessageBox('Error al cargar los archivos de la papelera');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTrashFiles();
    }
  }, [userId]);  const handleContextMenu = (e: React.MouseEvent, file: TrashFile) => {
    e.preventDefault();
    e.stopPropagation();

    // Obtener las dimensiones de la ventana
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Ancho estimado del menú contextual para móviles (ajusta según necesites)
    const menuWidth = window.innerWidth <= 768 ? 180 : 200;
    const menuHeight = 120; // Altura estimada del menú

    // Calcular posición ajustada
    let x = e.pageX;
    let y = e.pageY;

    // Ajustar horizontalmente si se sale de la pantalla
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10; // 10px de margen
    }
    if (x < 0) {
      x = 10; // 10px de margen
    }

    // Ajustar verticalmente si se sale de la pantalla
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10;
    }
    if (y < 0) {
      y = 10;
    }

    setContextMenu({
      x,
      y,
      file
    });
  };

  const handleRestore = async (file: TrashFile) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/restoreFile`, null, {
        params: { 
          fileName: file.pathName,
          userId 
        },
        withCredentials: true
      });
      
      await fetchTrashFiles();
      setContextMenu(null);
      
      const notification = document.createElement('div');
      notification.className = `notification ${effectiveMode === 'dark' ? 'dark' : ''}`;
      notification.textContent = `${file.displayName} restaurado a ${response.data.restoredTo}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
      
    } catch (error: any) {
      console.error('Error al restaurar archivo:', error);
      setColorMessageBox("#ff0000");
      // Mostrar el mensaje específico del servidor si existe
      setMessageMessageBox(
        error.response?.data?.error || 
        'Error al restaurar el archivo'
      );
    }
  };

  const handleDelete = async (file: TrashFile) => {
    setConfirmDialog({ isOpen: true, file });
  };

  const handleConfirmDelete = async () => {
    const file = confirmDialog.file;
    if (!file) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/api/permanentDelete`, {
        params: { 
          fileName: file.pathName,
          userId 
        },
        withCredentials: true
      });
      
      await fetchTrashFiles();
      setContextMenu(null);
      
      const notification = document.createElement('div');
      notification.className = `notification ${effectiveMode === 'dark' ? 'dark' : ''}`;
      notification.textContent = `${file.displayName} eliminado permanentemente`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
      
    } catch (error) {
      console.error('Error al eliminar archivo permanentemente:', error);
      setColorMessageBox("#ff0000");
      setMessageMessageBox('Error al eliminar el archivo permanentemente');
    }
  };

  const handlePreview = async (pathName: string, displayName: string) => {
    try {
      console.log("🔍 Attempting preview for:", { pathName, userId });
      
      const response = await axios.get(`${API_BASE_URL}/api/preview`, {
        params: { 
          fileName: pathName,
          folder: `.trash`,
          userId 
        },
        responseType: 'blob',
        withCredentials: true
      });

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const url = URL.createObjectURL(blob);
        const type = response.headers['content-type'];
        setPreview({ url, type, name: displayName });
  
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error: any) {
      console.error("❌ Preview error:", error.message);
      setColorMessageBox("#ff0000");
      setMessageMessageBox("No se pudo previsualizar el archivo. Por favor, intente restaurarlo.");
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/download`, {
        params: { 
          files,
          folder: '.trash',
          userId 
        },
        responseType: 'blob',
        withCredentials: true
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.split('__').pop() || fileName; // Extract original filename
      console.log("📥 Downloading file:", link.download);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error al descargar archivo:", error);
      setColorMessageBox("#ff0000");
      setMessageMessageBox("Error al descargar el archivo");
    }
  };

  const handleFileClick = (file: TrashFile) => {
    console.log("📂 File clicked:", file);
    handlePreview(file.pathName, file.displayName);
  };

  const getFileIcon = (file: TrashFile) => {
    // Si es un directorio, retornar icono de carpeta
    if (file.isDirectory) {
      return '📁';
    }

    // Si tenemos el mimeType, usarlo para determinar el icono
    if (file.mimeType) {
      if (file.mimeType.startsWith('image/')) {
        return '🖼️';
      }
      if (file.mimeType.startsWith('video/')) {
        return '🎥';
      }
      if (file.mimeType.startsWith('audio/')) {
        return '🎵';
      }
      if (file.mimeType === 'application/pdf') {
        return '📄';
      }
      if (file.mimeType.includes('compressed') || file.mimeType.includes('zip') || file.mimeType.includes('archive')) {
        return '🗜️';
      }
      if (file.mimeType.includes('text/')) {
        return '📃';
      }
    }

    // Si no hay mimeType o no es un tipo reconocido, usar la extensión como fallback
    const extension = file.displayName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      // Imágenes
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
      case 'svg':
        return '🖼️';
      // Documentos
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📽️';
      case 'pdf':
        return '📄';
      case 'txt':
      case 'md':
        return '📃';
      // Código
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'html':
      case 'css':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
        return '👨‍💻';
      // Por defecto
      default:
        return '📄';
    }
  };  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Debug log
      console.log('Global click', {
        target: e.target,
        isContextMenu: (e.target as Element).closest('.context-menu'),
        hasContextMenu: !!contextMenu
      });

      // Solo cerramos el menú si:
      // 1. El menú está abierto
      // 2. El clic no fue dentro del menú contextual
      // 3. El clic no fue un clic derecho
      if (contextMenu && 
          !(e.target as Element).closest('.context-menu') && 
          e.button !== 2) {
        setContextMenu(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && contextMenu) {
        setContextMenu(null);
      }
    };

    window.addEventListener('mousedown', handleGlobalClick);
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('mousedown', handleGlobalClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [contextMenu]);

  return (
    <div className={`trash-container ${effectiveMode === 'dark' ? 'dark' : ''}`}>
      <h1 className="trash-title">Papelera</h1>
      <div className="trash-content">
        {files.length === 0 ? (
          <p className="no-files">No hay archivos en la papelera</p>
        ) : (
          <div className="files-grid">
            {files.map((file) => (              <div
                key={file.pathName}
                className={`file-item ${effectiveMode === 'dark' ? 'dark' : ''}`}
                onClick={(e) => {
                  // Solo ejecutar handleFileClick si no fue un click derecho
                  if (e.button !== 2) {
                    handleFileClick(file);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleContextMenu(e, file);
                }}
                onTouchStart={(e) => {
                  let isLongPress = false;
                  const touchTimeout = setTimeout(() => {
                    isLongPress = true;
                    const touch = e.touches[0];
                    
                    // Obtener las dimensiones de la ventana
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const menuWidth = 180; // Ancho fijo para móviles
                    const menuHeight = 120; // Altura estimada del menú

                    // Calcular posición ajustada
                    let x = touch.pageX;
                    let y = touch.pageY;

                    // Ajustar horizontalmente si se sale de la pantalla
                    if (x + menuWidth > viewportWidth) {
                      x = viewportWidth - menuWidth - 10;
                    }
                    if (x < 0) {
                      x = 10;
                    }

                    // Ajustar verticalmente si se sale de la pantalla
                    if (y + menuHeight > viewportHeight) {
                      y = viewportHeight - menuHeight - 10;
                    }
                    if (y < 0) {
                      y = 10;
                    }

                    setContextMenu({
                      x,
                      y,
                      file
                    });
                  }, 500);

                  const handleTouchEnd = () => {
                    clearTimeout(touchTimeout);
                    if (!isLongPress) {
                      handleFileClick(file);
                    }
                    document.removeEventListener('touchend', handleTouchEnd);
                    document.removeEventListener('touchmove', handleTouchMove);
                  };

                  const handleTouchMove = () => {
                    clearTimeout(touchTimeout);
                    document.removeEventListener('touchend', handleTouchEnd);
                    document.removeEventListener('touchmove', handleTouchMove);
                  };

                  document.addEventListener('touchend', handleTouchEnd);
                  document.addEventListener('touchmove', handleTouchMove);
                }}
                style={{
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none'
                }}
              >
                <div className="file-icon">{getFileIcon(file)}</div>
                <div className="file-info">
                  <div className="file-details">
                    <span className="file-name-display">{file.displayName}</span>
                    <span>Ubicación original: {file.originalPath}</span>
                    <span>Eliminado: {file.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>      {contextMenu && (
        <div 
          className={`context-menu ${effectiveMode === 'dark' ? 'dark' : ''}`}
          style={{ 
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            display: 'block',
            zIndex: 1000
          }}
        >
          <div className="menu-item" onClick={() => handleRestore(contextMenu.file)}>
            <span className="icon">🔄</span>
            RESTAURAR
          </div>
          <div className="menu-item delete" onClick={() => handleDelete(contextMenu.file)}>
            <span className="icon">🗑️</span>
            ELIMINAR PERMANENTEMENTE
          </div>
        </div>
      )}

      {preview && (
        <ModalPreviewFile 
          preview={preview}
          onClose={() => {
            URL.revokeObjectURL(preview.url);
            setPreview(null);
          }}
          onDownload={handleDownload}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, file: null })}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        description={`¿Estás seguro de que deseas eliminar permanentemente "${confirmDialog.file?.displayName}"?`}
        confirmText="Sí"
        cancelText="No"
      />
    </div>
  );
};

export default Trash;
