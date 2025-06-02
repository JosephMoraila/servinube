import { useState, useEffect } from 'react';
import axios from 'axios';
import './Trash.css';
import { useAuth } from '../../components/ProtectedRoute/ProtectedRoute';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useMessageBoxContext } from '../../contexts/MessageBoxContext';
import API_BASE_URL from '../../constants/PAGE_URL';
import ModalPreviewFile from '../../components/ModalPreviewFile/ModalPreviewFile';

interface TrashFile {
  name: string;
  displayName: string;
  originalPath: string;
  timestamp: string;
}

const Trash = () => {
  const [files, setFiles] = useState<TrashFile[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: TrashFile } | null>(null);
  const [preview, setPreview] = useState<{ url: string; type: string; name: string; } | null>(null);
  const { userId } = useAuth();
  const { effectiveMode } = useDarkMode();
  const { setMessageMessageBox, setColorMessageBox } = useMessageBoxContext();

  const fetchTrashFiles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/listTrash`, {
        params: { userId },
        withCredentials: true
      });
      
      const trashFiles = response.data.files.map((fileName: string) => {
        // Dividimos el nombre del archivo por guiones bajos
        console.log('📁 Procesando archivo:', fileName);
        const parts = fileName.toString().split('_');
        console.log('📑 Partes separadas:', parts);

        // El primer elemento siempre es el timestamp
        const timestamp = parts[0];
        console.log('⏰ Timestamp:', timestamp);

        // El último elemento es el nombre original del archivo
        const name = parts[parts.length - 1];
        console.log('📄 Nombre del archivo:', name);

        // Todo lo que está entre el timestamp y el nombre es la ruta original
        // Si no hay ruta intermedia, se usa 'raíz'
        const originalPath = parts.slice(1, -1).join('/') || 'raíz';
        console.log('📂 Ruta original:', originalPath);

        // Ejemplo: "1748837197398_Foldercito_FREE_archivo.png"
        // timestamp: "1748837197398"
        // name: "archivo.png"
        // originalPath: "Foldercito/FREE"
        return {
          name: name,
          displayName: name,
          originalPath: originalPath,
          timestamp: new Date(parseInt(timestamp)).toLocaleString()
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
  }, [userId]);

  const handleContextMenu = (e: React.MouseEvent, file: TrashFile) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      file
    });
  };

  const handleRestore = async (file: TrashFile) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/restoreFile`, null, {
        params: { 
          fileName: file.name,
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
      
    } catch (error) {
      console.error('Error al restaurar archivo:', error);
      setColorMessageBox("#ff0000");
      setMessageMessageBox('Error al restaurar el archivo');
    }
  };

  const handleDelete = async (file: TrashFile) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente "${file.displayName}"?`)) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/api/permanentDelete`, {
        params: { 
          fileName: file.name,
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

  const handlePreview = async (fileName: string) => {
    try {
      console.log("🔍 Attempting preview for:", { fileName, userId });
      
      const response = await axios.get(`${API_BASE_URL}/api/preview`, {
        params: { 
          fileName,
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
        setPreview({ url, type, name: fileName });
        console.log("✅ Preview successful:", { type });
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error: any) {
      console.error("❌ Preview error:", error.message);
      setColorMessageBox("#ff0000");
      setMessageMessageBox("No se pudo previsualizar el archivo. Por favor, intente descargarlo.");
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/download`, {
        params: { 
          fileName,
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
    handlePreview(file.name);
  };

  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className={`trash-container ${effectiveMode === 'dark' ? 'dark' : ''}`}>
      <h1 className="trash-title">Papelera</h1>
      <div className="trash-content">
        {files.length === 0 ? (
          <p className="no-files">No hay archivos en la papelera</p>
        ) : (
          <div className="files-grid">
            {files.map((file) => (
              <div
                key={file.name}
                className={`file-item ${effectiveMode === 'dark' ? 'dark' : ''}`}
                onClick={() => handleFileClick(file)}
                onContextMenu={(e) => handleContextMenu(e, file)}
              >
                <div className="file-icon">🗑️</div>
                <div className="file-info">
                  <div className="file-details">
                    <span className="file-name-display">{file.name}</span>
                    <span>Ubicación original: {file.originalPath}</span>
                    <span>Eliminado: {file.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {contextMenu && (
        <div 
          className={`context-menu ${effectiveMode === 'dark' ? 'dark' : ''}`}
          style={{ top: contextMenu.y, left: contextMenu.x }}
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
    </div>
  );
};

export default Trash;
