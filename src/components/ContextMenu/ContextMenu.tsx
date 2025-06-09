import { FC, useEffect, useRef } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { ContextMenuProps } from '../../interfaces/component.interfaces';

export const ContextMenu: FC<ContextMenuProps> = ({
  x,
  y,
  file,
  isDirectory,
  onDownload,
  onDelete,
  onShare
}) => {
  const { effectiveMode } = useDarkMode();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Ajustar posición horizontal si se sale de la pantalla
    let adjustedX = x;
    if (x + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 10; // 10px de margen
    }
    if (adjustedX < 0) {
      adjustedX = 10; // 10px de margen
    }

    // Ajustar posición vertical si se sale de la pantalla
    let adjustedY = y;
    if (y + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 10; // 10px de margen
    }
    if (adjustedY < 0) {
      adjustedY = 10; // 10px de margen
    }

    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
  }, [x, y]);

  return (
    <div 
      ref={menuRef}
      className={`context-menu ${effectiveMode === 'dark' ? 'dark' : ''}`}
      style={{ position: 'fixed' }}
    >
      {!isDirectory && (
        <>
          <div className="menu-item" onClick={() => onDownload(file)}>
            <span className="icon">⬇️</span>
            DESCARGAR
          </div>
          {/*<div className="menu-item" onClick={() => onShare(file)}>
            <span className="icon">↗️</span>
            COMPARTIR
          </div>*/}
        </>
      )}
      <div className="menu-item delete" onClick={() => onDelete(file, isDirectory)}>
        <span className="icon">🗑️</span>
        {isDirectory ? 'ELIMINAR CARPETA' : 'ELIMINAR ARCHIVO'}
      </div>
    </div>
  );
};
