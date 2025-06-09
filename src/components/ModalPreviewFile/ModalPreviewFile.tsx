import { FC, useEffect, useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { ModalPreviewFileProps } from '../../interfaces/component.interfaces';
import './ModalPreviewFile.css';

/**
 * ModalPreviewFile Component
 * 
 * Un componente modal que permite previsualizar diferentes tipos de archivos:
 * - Imágenes (jpg, png, gif, etc.)
 * - Videos (mp4, webm, etc.)
 * - Audio (mp3, wav, etc.)
 * - PDFs
 * - Archivos de texto (txt, md, json, etc.)
 * - Código fuente (js, ts, py, etc.)
 * 
 * @component
 * @param {ModalPreviewFileProps} props - Props del componente
 * @param {Object} props.preview - Información del archivo a previsualizar
 * @param {string} props.preview.url - URL del archivo
 * @param {string} props.preview.type - Tipo MIME del archivo
 * @param {string} props.preview.name - Nombre del archivo
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onDownload - Función para descargar el archivo
 */
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

  const [textContent, setTextContent] = useState<string>('');

  /**
   * Determina si un archivo es de texto basado en su tipo MIME o extensión
   */
  const isTextFile = (type: string, filename: string): boolean => {
    const textMimes = ['text/', 'application/json', 'application/javascript', 'application/typescript'];
    const textExtensions = ['.txt', '.md', '.json', '.js', '.ts', '.py', '.html', '.css', '.csv'];
    
    return textMimes.some(mime => type.startsWith(mime)) ||
           textExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  /**
   * Carga y muestra el contenido de archivos de texto
   */
  useEffect(() => {
    const loadTextContent = async () => {
      if (isTextFile(preview.type, preview.name)) {
        try {
          const response = await fetch(preview.url);
          const text = await response.text();
          setTextContent(text);
        } catch (error) {
          setTextContent('Error al cargar el contenido del archivo');
        }
      }
    };

    loadTextContent();
  }, [preview.url, preview.type, preview.name]);

  /**
   * Renderiza el contenido del archivo según su tipo
   */
  const renderPreview = () => {
    // Imágenes
    if (preview.type.startsWith('image/')) {
      return <img src={preview.url} alt={preview.name} />;
    }
    
    // Videos
    if (preview.type.startsWith('video/')) {
      return <video src={preview.url} controls />;
    }
    
    // Audio
    if (preview.type.startsWith('audio/')) {
      return <audio src={preview.url} controls />;
    }
    
    // PDFs
    if (preview.type === 'application/pdf') {
      return (
        <iframe
          src={preview.url + '#toolbar=1'}
          title={preview.name}
          width="100%"
          height="100%"
          style={{ border: 'none', minHeight: '500px' }}
        />
      );
    }

    // Archivos de texto
    if (isTextFile(preview.type, preview.name)) {
      return (
        <pre className={`text-preview ${effectiveMode === 'dark' ? 'dark' : ''}`}>
          {textContent}
        </pre>
      );
    }

    // Formato no soportado
    return (
      <div className="unsupported-format">
        <p>Formato no soportado para previsualización</p>
        <p className="file-info">
          Tipo de archivo: {preview.type || 'Desconocido'}
        </p>
      </div>
    );
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`modal-overlay ${effectiveMode === 'dark' ? 'dark' : ''}`}
      onClick={handleOverlayClick}
    >
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