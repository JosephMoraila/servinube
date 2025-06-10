import { useState } from 'react';
import { ContextMenuState } from '../interfaces/component.interfaces';

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleContextMenu = (
    e: React.MouseEvent | React.TouchEvent | Touch,
    fileName: string,
    isDirectory: boolean
  ) => {
    if (e instanceof Touch) {
      setContextMenu({
        x: e.pageX,
        y: e.pageY,
        file: fileName,
        isDirectory
      });
    } else if ('touches' in e) {
      e.preventDefault();
      const touch = e.touches[0];
      setContextMenu({
        x: touch.pageX,
        y: touch.pageY,
        file: fileName,
        isDirectory
      });
    } else {
      e.preventDefault();
      setContextMenu({
        x: e.pageX,
        y: e.pageY,
        file: fileName,
        isDirectory
      });
    }
  };

  const closeContextMenu = () => setContextMenu(null);

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu
  };
};
