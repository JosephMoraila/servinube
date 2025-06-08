import { FC } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

interface ContextMenuProps {
  x: number;
  y: number;
  file: string;
  isDirectory: boolean;
  onDownload: (file: string) => void;
  onDelete: (file: string, isDirectory: boolean) => void;
}

export const ContextMenu: FC<ContextMenuProps> = ({
  x,
  y,
  file,
  isDirectory,
  onDownload,
  onDelete
}) => {
  const { effectiveMode } = useDarkMode();

  return (
    <div 
      className={`context-menu ${effectiveMode === 'dark' ? 'dark' : ''}`}
      style={{ top: y, left: x }}
    >
      {!isDirectory && (
        <div className="menu-item" onClick={() => onDownload(file)}>
          <span className="icon">⬇️</span>
          DESCARGAR
        </div>
      )}
      <div className="menu-item delete" onClick={() => onDelete(file, isDirectory)}>
        <span className="icon">🗑️</span>
        {isDirectory ? 'ELIMINAR CARPETA' : 'ELIMINAR ARCHIVO'}
      </div>
    </div>
  );
};
