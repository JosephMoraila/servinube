import React, { useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import '../CuadroDialogoInput/CuadroDialogoInput.css'; // Reutilizamos los estilos

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = '',
    description = '',
    confirmText = 'Sí',
    cancelText = 'No'
}) => {
    const { effectiveMode } = useDarkMode();

    // Close modal when Esc key is pressed
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

    if (!isOpen) return null;

    return (
        <div className="dialog-overlay">
            <div className={`dialog-content ${effectiveMode === 'dark' ? 'dark' : ''}`}>
                {title && <h2 className={`dialog-title ${effectiveMode === 'dark' ? 'dark' : ''}`}>{title}</h2>}
                {description && <p className={`dialog-paragraph ${effectiveMode === 'dark' ? 'dark' : ''}`}>{description}</p>}
                <div className="dialog-buttons">
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                    <button onClick={onClose}>
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;