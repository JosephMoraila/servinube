/**
 * Shared Component - Manages and displays files shared by and with the user
 * This component provides a tabbed interface to view:
 * 1. Files shared with the current user
 * 2. Files that the current user has shared with others
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Shared.css';
import { getFileIcon } from '../../utils/fileIcons';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../../components/ProtectedRoute/ProtectedRoute';
import API_BASE_URL from '../../constants/PAGE_URL';
import axios from 'axios';
import ModalPreviewFile from '../../components/ModalPreviewFile/ModalPreviewFile';

/** 
 * Interface representing a shared file's data structure
 */
interface SharedFile {
    id: number;           // Unique identifier for the shared file
    file_path: string;    // Full path to the file in the system
    file_name: string;    // Name of the file
    owner_id: number;     // ID of the file's owner
    owner_name: string;   // Name of the file's owner
    shared_with_name?: string;  // Name of the user the file is shared with (optional)
    shared_at: string;    // Timestamp when the file was shared
    mimeType?: string;    // MIME type of the file (optional)
}

export default function Shared() {
    // Hooks and state management
    const userId = useAuth().userId;
    const { effectiveMode } = useDarkMode();
    const [sharedByMe, setSharedByMe] = useState<SharedFile[]>([]);
    const [sharedWithMe, setSharedWithMe] = useState<SharedFile[]>([]);
    const [activeTab, setActiveTab] = useState<'shared-by-me' | 'shared-with-me'>('shared-with-me');
    const [preview, setPreview] = useState<{ url: string; type: string; name: string; } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSharedFiles();
        // eslint-disable-next-line
    }, []);

    /**
     * Fetches the list of shared files from the server
     * This includes both files shared by the user and files shared with the user
     */
    const fetchSharedFiles = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/shared-files?userId=${userId}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setSharedByMe(data.sharedByMe);
                setSharedWithMe(data.sharedWithMe);
            } else if (response.status === 401) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Error fetching shared files:', error);
        }
    };

    /**
     * Handles clicking on a file to preview it
     * @param filePath - The full path to the file
     * @param ownerId - The ID of the file's owner
     */
    const handleFileClick = async (filePath: string, ownerId: number) => {
        console.log('File path clicked:', filePath);
        try {
            const pathParts = filePath.split('/');
            pathParts.shift(); // Elimina el primer elemento (userId)
            const fileName = pathParts.pop() || '';
            const folder = pathParts.join('/');
            
            console.log('Processed path:', {
                fileName,
                folder,
                originalPath: filePath,
                ownerId
            });

            console.log('Fetching preview for file:', fileName, 'in folder:', folder, 'for ownerId:', ownerId);
            const response = await axios.get(`${API_BASE_URL}/api/preview`, {
                params: {
                    fileName,
                    folder,
                    userId: ownerId // Usamos el ID del propietario del archivo
                },
                responseType: 'blob',
                withCredentials: true
            });

            if (response.status === 200) {
                const blob = new Blob([response.data], { type: response.headers['content-type'] });
                const url = URL.createObjectURL(blob);
                const type = response.headers['content-type'];
                setPreview({ url, type, name: fileName });
            }
        } catch (error) {
            console.error('Error previewing file:', error);
        }
    };

    /**
     * Handles file download when requested from the preview modal
     * @param fileName - The name of the file to download
     */
    const handleDownload = async (fileName: string) => {
        try {
            // Buscar el archivo en ambas listas
            const file = [...sharedByMe, ...sharedWithMe].find(f => f.file_name === fileName);
            if (!file) {
                console.error('Archivo no encontrado');
                return;
            }
            
            const pathParts = file.file_path.split('/');
            pathParts.shift(); // Elimina el primer elemento (userId)
            const folder = pathParts.slice(0, -1).join('/');
            
            const response = await axios.get(`${API_BASE_URL}/api/download`, {
                params: { 
                    fileName,
                    folder,
                    userId: file.owner_id // Using the file owner's ID instead of current user's ID
                },
                responseType: 'blob',
                withCredentials: true
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    // Component rendering
    return (
        <div className={`shared-container ${effectiveMode === 'dark' ? 'dark' : ''}`}>
            <div className={`shared-tabs ${effectiveMode === 'dark' ? 'dark' : ''}`}>
                <button 
                    className={`tab-button ${activeTab === 'shared-with-me' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shared-with-me')}
                >
                    Compartidos conmigo
                </button>
                <button 
                    className={`tab-button ${activeTab === 'shared-by-me' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shared-by-me')}
                >
                    Compartidos por mí
                </button>
            </div>

            <div className={`shared-content ${effectiveMode === 'dark' ? 'dark' : ''}`}>
                {activeTab === 'shared-with-me' ? (
                    <div className="files-grid">
                        {sharedWithMe.length === 0 ? (
                            <p className="no-files">No hay archivos compartidos contigo</p>
                        ) : (
                            sharedWithMe.map((file) => (
                                <div 
                                    key={file.id} 
                                    className="file-card"
                                    onClick={() => handleFileClick(file.file_path, file.owner_id)}
                                >
                                    <span className="file-icon">
                                        {getFileIcon(file.file_name, false, file.mimeType)}
                                    </span>
                                    <div className="file-info">
                                        <p className="file-name">{file.file_name}</p>
                                        <p className="shared-by">Compartido por: {file.owner_name}</p>
                                        <p className="shared-date">
                                            {new Date(file.shared_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="files-grid">
                        {sharedByMe.length === 0 ? (
                            <p className="no-files">No has compartido ningún archivo</p>
                        ) : (
                            sharedByMe.map((file) => (
                                <div 
                                    key={file.id} 
                                    className="file-card"
                                    onClick={() => handleFileClick(file.file_path, file.owner_id)}
                                >
                                    <span className="file-icon">
                                        {getFileIcon(file.file_name, false, file.mimeType)}
                                    </span>
                                    <div className="file-info">
                                        <p className="file-name">{file.file_name}</p>
                                        <p className="shared-with">
                                            Compartido con: {file.shared_with_name}
                                        </p>
                                        <p className="shared-date">
                                            {new Date(file.shared_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {preview && (
                <ModalPreviewFile
                    preview={preview}
                    onClose={() => setPreview(null)}
                    onDownload={handleDownload}
                />
            )}
        </div>
    );
}