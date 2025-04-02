import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../components/ProtectedRoute/ProtectedRoute";
import "./Feed.css";
import { useDarkMode } from '../../contexts/DarkModeContext'

/**
 * Interface representing a file upload progress
 * @interface
 * @property {string} name - The name of the file being uploaded
 * @property {number} progress - The upload progress percentage (0-100)
 */
interface FileProgress {
  name: string;
  progress: number;
}

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

  // File and folder management state
  const [files, setFiles] = useState<{ name: string; isDirectory: boolean }[]>([]);
  const [folderName, setFolderName] = useState("");
  const [currentFolder, setCurrentFolder] = useState<string>("");

  // UI state management
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<FileProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: string } | null>(null);

  // DOM References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Theme context
  const { effectiveMode } = useDarkMode();


    /**
   * Fetches the list of files and folders from the server
   * Updates when currentFolder or userId changes
   */
  useEffect(() => {
    if (userId) {
      fetchFiles();
    }
  }, [currentFolder, userId]);

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
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);


  /**
   * Fetches and formats the list of files and folders from the server
   * @async
   */
  const fetchFiles = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(`http://localhost:3000/api/list`, {
        params: { folder: currentFolder, userId },
        withCredentials: true
      });
      
      const formattedFiles = response.data.files.map((file: { name: string }) => ({
        name: file.name,
        isDirectory: !file.name.includes("."),
      }));
      
      setFiles(formattedFiles);
    } catch (error) {
      console.error("❌ Error al obtener archivos:", error);
    }
  };

    /**
   * Creates a new folder in the current directory
   * @async
   * @throws {Error} When folder name is empty or userId is not available
   */
  const createFolder = async () => {
    if (!folderName || !userId) {
      alert("Ingrese un nombre para la carpeta");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/create-folder", {
        folder: currentFolder ? `${currentFolder}/${folderName}` : folderName,
        userId,
      });

      await fetchFiles();
      setFolderName("");
      setShowFolderModal(false);
    } catch (error) {
      console.error("❌ Error al crear carpeta:", error);
      alert("Error al crear la carpeta");
    }
  };


  /**
   * Handles file selection from the file input
   * Supports multiple file uploads with progress tracking
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event
   * @async
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
  
    setUploading(true);
    setUploadProgress(selectedFiles.map(file => ({ name: file.name, progress: 0 })));
  
    try {
      // Upload files in parallel using Promise.all
      await Promise.all(selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        
        await axios.post("http://localhost:3000/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          params: {
            userId,
            folder: currentFolder
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
            setUploadProgress(prev => 
              prev.map(item => 
                item.name === file.name 
                  ? { ...item, progress: percentCompleted }
                  : item
              )
            );
          }
        });
      }));
  
      console.log("✅ Todos los archivos se subieron correctamente");
      await fetchFiles();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("❌ Error al subir archivos:", error);
      alert("Error al subir uno o más archivos");
    } finally {
      setUploading(false);
      setUploadProgress([]);
    }
  };

   /**
   * Updates the current folder path for navigation
   * @param {string} folderName - The name of the folder to navigate to
   */
  const navigateToFolder = (folderName: string) => {
    setCurrentFolder(prev => prev ? `${prev}/${folderName}` : folderName);
  };

    /**
   * Navigates to the parent folder
   * Splits the current path and removes the last segment
   */
  const goBack = () => {
    setCurrentFolder(prev => {
      const parts = prev.split("/");
      parts.pop();
      return parts.join("/");
    });
  };

    /**
   * Toggles the visibility of the new item menu
   */
  const handleNewClick = () => {
    setShowNewMenu(!showNewMenu);
  };

    /**
   * Opens the folder creation modal
   */
  const handleCreateFolderClick = () => {
    setShowNewMenu(false);
    setShowFolderModal(true);
  };

    /**
   * Triggers the hidden file input click
   */
  const handleUploadClick = () => {
    setShowNewMenu(false);
    fileInputRef.current?.click();
  };

    /**
   * Handles the drag over event for file drag and drop
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

   /**
   * Handles the drag leave event for file drag and drop
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
    /**
   * Handles the file drop event
   * Processes multiple files and shows upload progress
   * @param {React.DragEvent<HTMLDivElement>} e - The drop event
   * @async
   */
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;
  
    setUploading(true);
    setUploadProgress(droppedFiles.map(file => ({ name: file.name, progress: 0 })));
  
    try {
      await Promise.all(droppedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        
        await axios.post("http://localhost:3000/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          params: {
            userId,
            folder: currentFolder
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
            setUploadProgress(prev => 
              prev.map(item => 
                item.name === file.name 
                  ? { ...item, progress: percentCompleted }
                  : item
              )
            );
          }
        });
      }));
  
      console.log("✅ Todos los archivos se subieron correctamente");
      await fetchFiles();
    } catch (error) {
      console.error("❌ Error al subir archivos:", error);
      alert("Error al subir uno o más archivos");
    } finally {
      setUploading(false);
      setUploadProgress([]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, fileName: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      file: fileName
    });
  };

  const handleDownload = async (fileName: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/download`, {
        params: { 
          fileName,
          folder: currentFolder,
          userId 
        },
        responseType: 'blob',
        withCredentials: true
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error al descargar archivo:", error);
      alert("Error al descargar el archivo");
    }
  };

  return (
    <div className={`feed-container ${effectiveMode === 'dark' ? 'dark' : ''}`} onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}>

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
          <button onClick={goBack} className={`button-back-folder ${effectiveMode === 'dark' ? 'dark' : ''}`}>⬅️ Volver</button>
        )}
        <span>📂 {currentFolder || "Mi unidad"}</span>
      </div>

      <div className="files-container">
        <div className="files-grid">
          {files.map((file, index) => (
            <div
              key={index}
              className={`file-item ${effectiveMode === 'dark' ? 'dark' : ''}`}
              onClick={() => file.isDirectory && navigateToFolder(file.name)}
              onContextMenu={(e) => !file.isDirectory && handleContextMenu(e, file.name)}
            >
              <div className="file-icon">
                {file.isDirectory ? "📁" : "📄"}
              </div>
              <div className="file-name">{file.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add context menu */}
      {contextMenu && (
        <div 
          className={`context-menu ${effectiveMode === 'dark' ? 'dark' : ''}`}
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="menu-item" onClick={() => handleDownload(contextMenu.file)}>
            <span className="icon">⬇️</span>
            DESCARGAR
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        multiple
        accept="*/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      {/* Upload progress indicator */}
      {uploading && uploadProgress.length > 0 && (
        <div className={`upload-progress ${effectiveMode === 'dark' ? 'dark' : ''}`}>
          {uploadProgress.map((file) => (
            <div key={file.name} className={`progress-item ${effectiveMode === 'dark' ? 'dark' : ''}`}>
              <span className="filename">{file.name}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
              <span className="progress-text">{file.progress}%</span>
            </div>
          ))}
        </div>
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
    </div>
  );
};

export default Feed;