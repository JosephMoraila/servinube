import { FC } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { ContextMenuProps } from '../../interfaces/component.interfaces';

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
