import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../components/ProtectedRoute/ProtectedRoute";
import "./Feed.css";
import { useDarkMode } from '../../contexts/DarkModeContext';
import API_BASE_URL from "../../constants/PAGE_URL";
import { useMessageBoxContext } from "../../contexts/MessageBoxContext";
import ModalPreviewFile from '../../components/ModalPreviewFile/ModalPreviewFile';
import DialogInput from '../../components/CuadroDialogoInput/CuadroDialogoInput';
import { UploadProgress } from '../../components/UploadProgress/UploadProgress';
import { ContextMenu } from '../../components/ContextMenu/ContextMenu';
import ShareDialog from '../../components/ShareDialog/ShareDialog';
import { useFileManager } from '../../hooks/useFileManager';
import { useContextMenu } from '../../hooks/useContextMenu';
import { getFileIcon } from '../../utils/fileIcons';
import { FileItem, PreviewState, DeleteDialogState } from '../../interfaces/file.interfaces';

/**
 * Feed Component
 * Provides a file management interface similar to Google Drive
 * 
 * Features:
 * - File upload via button or drag-and-drop
 * - Folder creation and navigation
 * - Progress tracking for file uploads
 * - Dark mode support
 * - Multi-file upload support
 * 
 * @component
 */
const Feed = () => {
  // Authentication context
  const { userId } = useAuth();
  const { setMessageMessageBox, setColorMessageBox } = useMessageBoxContext();
  const { effectiveMode } = useDarkMode();

  // File and folder management state
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folderName, setFolderName] = useState("");
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [shareDialogState, setShareDialogState] = useState({
    isOpen: false,
    fileName: '',
    isSharing: false,
    error: null as string | null
  });

  // UI state management
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ 
    isOpen: false, 
    fileName: '', 
    isDirectory: false 
  });

  // DOM References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchFiles = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/list`, {
        params: { folder: currentFolder, userId },
        withCredentials: true
      });
      
      const formattedFiles = response.data.files
        .filter((file: { name: string }) => file.name !== '.trash')
        .map((file: FileItem) => ({
          name: file.name,
          isDirectory: file.isDirectory,
          mimeType: file.mimeType
        }));
      
      setFiles(formattedFiles);
    } catch (error) {
      console.error("❌ Error al obtener archivos:", error);
    }
  }, [currentFolder, userId]);

  const { uploading, uploadProgress, uploadFiles, downloadFile } = useFileManager(userId, currentFolder, fetchFiles);
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();

  /**
   * Fetches the list of files and folders from the server
   * Updates when currentFolder or userId changes
   */
  useEffect(() => {
    if (userId) {
      fetchFiles();
    }
  }, [currentFolder, userId, fetchFiles]);

  /**
   * Handles clicking outside the new menu to close it
   * Adds and removes event listener on component mount/unmount
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowNewMenu(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => closeContextMenu();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [closeContextMenu]);


  /**
   * Creates a new folder in the current directory
   * @async
   * @throws {Error} When folder name is empty or userId is not available
   */
  const createFolder = async () => {
    if (!folderName || !userId) {
      setColorMessageBox("#ff0000");
      setMessageMessageBox("Ingrese un nombre para la carpeta");
      return;
    }

    if (folderName.includes("/") || folderName.includes("\\")) {
      setColorMessageBox("#ff0000");
      setMessageMessageBox("El nombre de la carpeta no puede contener / o \\");
      return;
    }

    if (folderName === ".trash") {
      setColorMessageBox('#ff0000');
      setMessageMessageBox ("No se puede crear una carpeta con ese nombre.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/create-folder`, {
        folder: currentFolder ? `${currentFolder}/${folderName}` : folderName,
        userId,
      });

      await fetchFiles();
      setFolderName("");
      setShowFolderModal(false);
    } catch (error) {
      console.error("❌ Error al crear carpeta:", error);
      setColorMessageBox("#ff0000");
      setMessageMessageBox("Error al crear carpeta. Intente nuevamente.");
      
    }
  };

  // Event Handlers
  const handleNewClick = () => {
    setShowNewMenu(!showNewMenu);
  };

  const handleCreateFolderClick = () => {
    setShowNewMenu(false);
    setShowFolderModal(true);
  };

  const handleUploadClick = () => {
    setShowNewMenu(false);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
  
    try {
      await uploadFiles(selectedFiles);
    } catch (error) {
      setColorMessageBox("#ff0000");
      setMessageMessageBox("Error al subir uno o más archivos");
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (file.isDirectory) {
      navigateToFolder(file.name);
    } else {
      handlePreview(file.name);
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      await downloadFile(fileName);
    } catch (error) {
      setColorMessageBox("#ff0000");
      setMessageMessageBox("Error al descargar el archivo");
    }
  };

  const handleDelete = async (fileName: string, isDirectory: boolean) => {
    setDeleteDialog({ isOpen: true, fileName, isDirectory });
  };

  const handleConfirmDelete = async (inputValue: string) => {
    if (inputValue !== 'ELIMINAR') return;
    
    const { fileName, isDirectory } = deleteDialog;
    try {
      await axios.delete(`${API_BASE_URL}${isDirectory ? '/api/deleteFolder' : '/api/deleteFile'}`, {
        params: { 
          fileName,
          name: fileName,
          folder: currentFolder,
          userId               
        },
        withCredentials: true
      });
      
      await fetchFiles();
      closeContextMenu();
      
      const notification = document.createElement('div');
      notification.className = `notification ${effectiveMode === 'dark' ? 'dark' : ''}`;
      notification.textContent = `${fileName} movido a la papelera`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
      
    } catch (error) {
      console.error(`❌ Error al mover ${isDirectory ? 'carpeta' : 'archivo'} a papelera:`, error);
      setColorMessageBox("#ff0000");
      setMessageMessageBox(`Error al mover ${isDirectory ? 'la carpeta' : 'el archivo'} a la papelera`);
    }
  };

  /**
   * Opens the share dialog for a file
   * @param {string} fileName - The name of the file to share
   */
  const handleShare = (fileName: string) => {
    console.log("🔗 Abriendo diálogo de compartir para:", fileName);
    setShareDialogState({
      isOpen: true,
      fileName,
      isSharing: false,
      error: null
    });
  };

  /**
   * Handles the sharing of a file with a specific user
   * @async
   * @param {string} username - The username to share the file with
   */
  const handleShareSubmit = async (username: string) => {
    console.log("🔗 Compartiendo archivo:", shareDialogState.fileName, "con usuario:", username);
    setShareDialogState(prev => ({ ...prev, isSharing: true, error: null }));
    try {
      await axios.post(`${API_BASE_URL}/api/shareFile`, {
        fileName: shareDialogState.fileName,
        folder: currentFolder,
        userId,
        username
      }, { withCredentials: true });
      
      setColorMessageBox("#4BB543");
      setMessageMessageBox("Archivo compartido exitosamente");
      setShareDialogState(prev => ({ ...prev, isOpen: false }));
    } catch (error: any) {
      console.error("Error al compartir el archivo:", error);
      const errorMessage = error.response?.data?.message || "Error al compartir el archivo";
      setShareDialogState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setShareDialogState(prev => ({ ...prev, isSharing: false }));
    }
  };

  const handlePreview = async (fileName: string) => {
    try {
      console.log("🔍 Attempting preview for:", { fileName, folder: currentFolder, userId });
      
      const response = await axios.get(`${API_BASE_URL}/api/preview`, {
        params: { 
          fileName,
          folder: currentFolder,
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

  // Navigation functions
  const navigateToFolder = (folderName: string) => {
    setCurrentFolder(prev => prev ? `${prev}/${folderName}` : folderName);
  };

  const goBack = () => {
    setCurrentFolder(prev => {
      const parts = prev.split("/");
      parts.pop();
      return parts.join("/");
    });
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (preview) return;
    e.preventDefault();
    e.stopPropagation();
    
    // No mostrar el overlay si el arrastre es interno
    const isInternalDrag = e.dataTransfer.types.includes('text/html');
    if (!isInternalDrag) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (preview) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (preview) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Verificar si el arrastre viene de la misma página
    const isInternalDrag = e.dataTransfer.types.includes('text/html');
    if (isInternalDrag) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    try {
      await uploadFiles(droppedFiles);
    } catch (error) {
      setColorMessageBox("#ff0000");
      setMessageMessageBox("Error al subir uno o más archivos");
    }
  };

  // Effect hooks
  useEffect(() => {
    if (userId) {
      fetchFiles();
    }
  }, [currentFolder, userId, fetchFiles]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowNewMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => closeContextMenu();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [closeContextMenu]);




  return (
    <div 
      className={`feed-container ${effectiveMode === 'dark' ? 'dark' : ''}`} 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ pointerEvents: preview ? 'none' : 'auto' }}
    >

          {/* Add this before your existing content */}
    <div className={`drop-overlay ${isDragging ? 'active' : ''} ${effectiveMode === 'dark' ? 'dark' : ''}`}>
      <div className="drop-overlay-content">
        <span className="icon">📥</span>
        <div>SOLTAR ARCHIVO</div>
      </div>
    </div>

      <div className={`feed-header ${effectiveMode === 'dark' ? 'dark' : ''}`}>
        <h1 className={`feed-title ${effectiveMode === 'dark' ? 'dark' : ''}`}>Mi unidad</h1>
        <div className={`new-button ${effectiveMode === 'dark' ? 'dark' : ''}`} ref={menuRef}>
          <button onClick={handleNewClick}>
            <span>➕</span>
            Nuevo
          </button>
          {showNewMenu && (
            <div className={`new-menu ${effectiveMode === 'dark' ? 'dark' : ''}`}>
              <div className="menu-item" onClick={handleCreateFolderClick}>
                <span className="icon">📁</span>
                Nueva carpeta
              </div>
              <div className="menu-item" onClick={handleUploadClick}>
                <span className="icon">📤</span>
                Subir archivos
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="navigation">
        {currentFolder && (
          <button onClick={goBack} className={`button-back-folder ${effectiveMode === 'dark' ? 'dark' : ''}`}>
            ⬅️ Volver
          </button>
        )}
        <span>📂 {currentFolder || "Mi unidad"}</span>
      </div>

      <div className="files-container">
        <div className="files-grid">
          {files.map((file) => (
            <div
              key={file.name}
              className={`file-item ${effectiveMode === 'dark' ? 'dark' : ''}`}
              onClick={() => handleFileClick(file)}
              onContextMenu={(e) => handleContextMenu(e, file.name, file.isDirectory)}
            >
              <span className="file-icon">{getFileIcon(file.name, file.isDirectory, file.mimeType)}</span>
              <span className="file-name">{file.name}</span>
            </div>
          ))}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          {...contextMenu}
          onDownload={downloadFile}
          onDelete={handleDelete}
          onShare={handleShare}
        />
      )}

      <input
        type="file"
        multiple
        accept="*/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      {uploading && uploadProgress.length > 0 && (
        <UploadProgress uploadProgress={uploadProgress} />
      )}

      {/* Folder creation modal */}
      {showFolderModal && (
        <div className="modal">
          <div className={`modal-content ${effectiveMode === 'dark' ? 'dark' : ''}`}>
            <div className="modal-header">
              <h2 className="modal-title">Nueva carpeta</h2>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Nombre de la carpeta"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button
                className="cancel"
                onClick={() => {
                  setShowFolderModal(false);
                  setFolderName("");
                }}
              >
                Cancelar
              </button>
              <button
                className="confirm"
                onClick={createFolder}
                disabled={!folderName.trim()}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div style={{ pointerEvents: 'auto' }}>
          <ModalPreviewFile 
            preview={preview}
            onClose={() => setPreview(null)}
            onDownload={handleDownload}
          />
        </div>
      )}

      <DialogInput
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        description={`¿Estás seguro de que deseas mover "${deleteDialog.fileName}" ${
          deleteDialog.isDirectory ? 'y todo su contenido' : ''
        } a la papelera? Escribe ELIMINAR para confirmar.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        placeholder="Escribe ELIMINAR para confirmar"
        typeInput="text"
      />

      <ShareDialog
        isOpen={shareDialogState.isOpen}
        onClose={() => setShareDialogState(prev => ({ ...prev, isOpen: false }))}
        onShare={handleShareSubmit}
        fileName={shareDialogState.fileName}
        isSharing={shareDialogState.isSharing}
        error={shareDialogState.error}
      />
    </div>
  );
};

export default Feed;