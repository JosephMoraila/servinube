import { useDarkMode } from '../../contexts/DarkModeContext';
import { useEffect } from 'react';
import './ModalPreviewFile.css';

interface PreviewData {
  url: string;
  type: string;
  name: string;
}

interface ModalPreviewFileProps {
  preview: PreviewData;
  onClose: () => void;
  onDownload: (fileName: string) => void;
}

const ModalPreviewFile = ({ preview, onClose, onDownload }: ModalPreviewFileProps) => {
  const { effectiveMode } = useDarkMode();

  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      URL.revokeObjectURL(preview.url);
      onClose();
    }
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        URL.revokeObjectURL(preview.url);
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose, preview.url]);

  return (
    <div className="modal" onClick={handleModalClick}>
      <div className={`modal-content preview-modal ${effectiveMode === 'dark' ? 'dark' : ''}`}>
        <div className="modal-header">
          <h2>{preview.name}</h2>
          <button onClick={() => {
            URL.revokeObjectURL(preview.url);
            onClose();
          }}>✖️</button>
        </div>
        <div className="modal-body preview-content">
          {preview.type.startsWith('image/') && (
            <img src={preview.url} alt={preview.name} />
          )}
          {preview.type.startsWith('video/') && (
            <video controls>
              <source src={preview.url} type={preview.type} />
              Tu navegador no soporta el elemento de video.
            </video>
          )}
          {preview.type.startsWith('audio/') && (
            <audio controls>
              <source src={preview.url} type={preview.type} />
              Tu navegador no soporta el elemento de audio.
            </audio>
          )}
          {preview.type === 'application/pdf' && (
            <iframe
              src={preview.url}
              title={preview.name}
              width="100%"
              height="100%"
            />
          )}
          {!preview.type.match(/^(image|video|audio|application\/pdf)/) && (
            <div className="no-preview">
              <p>No hay vista previa disponible para este tipo de archivo</p>
              <button onClick={() => onDownload(preview.name)}>
                Descargar archivo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalPreviewFile;