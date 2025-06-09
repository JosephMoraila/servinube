import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Shared.css';
import { getFileIcon } from '../../utils/fileIcons';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../../components/ProtectedRoute/ProtectedRoute';

interface SharedFile {
    id: number;
    file_path: string;
    file_name: string;
    owner_id: number;
    owner_name: string;
    shared_with_name?: string;
    shared_at: string;
}

export default function Shared() {
    const userId = useAuth().userId;
    const { effectiveMode } = useDarkMode();
    const [sharedByMe, setSharedByMe] = useState<SharedFile[]>([]);
    const [sharedWithMe, setSharedWithMe] = useState<SharedFile[]>([]);
    const [activeTab, setActiveTab] = useState<'shared-by-me' | 'shared-with-me'>('shared-with-me');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSharedFiles();
        // eslint-disable-next-line
    }, []);

    const fetchSharedFiles = async () => {
        try {
            const response = await fetch(`/api/shared-files?userId=${userId}`, {
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

    const handleFileClick = async (filePath: string) => {
        try {
            const response = await fetch(`/api/preview-file?path=${encodeURIComponent(filePath)}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                // Aquí podrías abrir un modal para previsualizar el archivo
                // o redirigir a una página de previsualización
            }
        } catch (error) {
            console.error('Error previewing file:', error);
        }
    };

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
                                    onClick={() => handleFileClick(file.file_path)}
                                >
                                    <img 
                                        src={getFileIcon(file.file_name, false)} 
                                        alt="File icon" 
                                        className="file-icon"
                                    />
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
                                    onClick={() => handleFileClick(file.file_path)}
                                >
                                    <img 
                                        src={getFileIcon(file.file_name, false)} 
                                        alt="File icon" 
                                        className="file-icon"
                                    />
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
        </div>
    );
}