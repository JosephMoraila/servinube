import { FC, useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import './ShareDialog.css';

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onShare: (username: string) => void;
    fileName: string;
    isSharing: boolean;
    error: string | null;
}

const ShareDialog: FC<ShareDialogProps> = ({
    isOpen,
    onClose,
    onShare,
    fileName,
    isSharing,
    error
}) => {
    const { effectiveMode } = useDarkMode();
    const [username, setUsername] = useState<string>('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (username.trim()) {
            onShare(username.trim());
        }
    };

    const handleClose = () => {
        setUsername('');
        onClose();
    };

    return (
        <div className="dialog-overlay">
            <div className={`dialog-content ${effectiveMode === 'dark' ? 'dark' : ''}`}>
                <h2 className={`dialog-title ${effectiveMode === 'dark' ? 'dark' : ''}`}>
                    Compartir archivo
                </h2>
                <p className={`dialog-paragraph ${effectiveMode === 'dark' ? 'dark' : ''}`}>
                    Ingresa el nombre de usuario con el que deseas compartir "{fileName}"
                </p>
                <div className="dialog-form">
                    <input
                        type="text"
                        placeholder="Nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`dialog-input ${error ? 'error' : ''}`}
                    />
                    {error && <p className="dialog-error">{error}</p>}
                </div>
                <div className="dialog-buttons">
                    <button
                        onClick={handleSubmit}
                        disabled={isSharing || !username.trim()}
                    >
                        {isSharing ? 'Compartiendo...' : 'Compartir'}
                    </button>
                    <button onClick={handleClose}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareDialog;
