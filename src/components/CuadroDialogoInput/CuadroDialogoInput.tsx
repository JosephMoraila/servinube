import { FC, useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { DialogInputProps } from '../../interfaces/component.interfaces';
import './CuadroDialogoInput.css';

const DialogInput: FC<DialogInputProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  placeholder,
  typeInput
}) => {
    const [inputValue, setInputValue] = useState<string>('');
    const { effectiveMode } = useDarkMode(); 

    // Close modal when Esc key is pressed
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose(); // Close the dialog if Escape key is pressed
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        // Cleanup the event listener when the component is unmounted or modal is closed
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
                <input
                    type={typeInput}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="dialog-input"
                />
                <div className="dialog-buttons">
                    <button
                        onClick={() => {
                            onConfirm(inputValue); // Pass the value to the parent
                            setInputValue(''); // Clear the input field
                            onClose(); // Close the dialog
                        }}
                        disabled={!inputValue.trim()}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={() => {
                            setInputValue(''); // Clear the input field
                            onClose(); // Close the dialog
                        }}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DialogInput;
