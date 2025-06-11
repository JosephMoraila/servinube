import { useState } from 'react';
import { ContextMenuState } from '../interfaces/component.interfaces';

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);  const handleContextMenu = (
    e: React.MouseEvent | React.TouchEvent | { pageX: number; pageY: number },
    fileName: string,
    isDirectory: boolean
  ) => {
    let posX: number;
    let posY: number;

    if ('touches' in e) {
      // TouchEvent
      e.preventDefault();
      const touch = e.touches[0];
      posX = touch.pageX;
      posY = touch.pageY;
    } else if ('pageX' in e && 'pageY' in e) {
      // MouseEvent or touch coordinates object
      if ('preventDefault' in e) {
        e.preventDefault();
      }
      posX = e.pageX;
      posY = e.pageY;
    } else {
      return;
    }

    setContextMenu({
      x: posX,
      y: posY,
      file: fileName,
      isDirectory
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu
  };
};
