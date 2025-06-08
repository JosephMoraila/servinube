import { FC, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { ModalPreviewFileProps } from '../../interfaces/component.interfaces';
import './ModalPreviewFile.css';

const ModalPreviewFile: FC<ModalPreviewFileProps> = ({
  preview,
  onClose,
  onDownload
}) => {
  const { effectiveMode } = useDarkMode();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const renderPreview = () => {
    if (preview.type.startsWith('image/')) {
      return <img src={preview.url} alt={preview.name} />;
    }
    if (preview.type.startsWith('video/')) {
      return <video src={preview.url} controls />;
    }
    if (preview.type.startsWith('audio/')) {
      return <audio src={preview.url} controls />;
    }
    return <div className="unsupported-format">Formato no soportado para previsualización</div>;
  };

  return (
    <div className={`modal-overlay ${effectiveMode === 'dark' ? 'dark' : ''}`}>
      <div className="modal-preview">
        <div className="modal-header">
          <h3>{preview.name}</h3>
          <div className="modal-actions">
            <button onClick={() => onDownload(preview.name)} className="download-button">
              ⬇️ Descargar
            </button>
            <button onClick={onClose} className="close-button">✖️</button>
          </div>
        </div>
        <div className="preview-content">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default ModalPreviewFile;